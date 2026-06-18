import json
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
import hashlib
import re
import ssl
import traceback
from datetime import time, datetime

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib import messages
from django.db import transaction

from .models import TimetableSubject

def get_pastel_color(subject_name):
    """Generate consistent pastel HSL color based on subject name for text-white readability"""
    hash_val = int(hashlib.md5(subject_name.encode('utf-8')).hexdigest(), 16)
    h = hash_val % 360
    s = 55 + (hash_val % 15)  # 55% ~ 70%
    l = 45 + (hash_val % 15)  # 45% ~ 60%
    return f"hsl({h}, {s}%, {l}%)"

@login_required
def timetable_view(request):
    """Render timetable page"""
    subjects = TimetableSubject.objects.filter(user=request.user)
    
    # Format subjects for easy frontend rendering
    subjects_data = []
    for s in subjects:
        subjects_data.append({
            'id': s.id,
            'subject_name': s.subject_name,
            'professor': s.professor,
            'classroom': s.classroom,
            'day_of_week': s.day_of_week,
            'start_time': s.start_time.strftime('%H:%M'),
            'end_time': s.end_time.strftime('%H:%M'),
            'color': s.color or get_pastel_color(s.subject_name)
        })

    return render(request, 'schedules/timetable.html', {
        'title': '내 시간표',
        'subjects_json': json.dumps(subjects_data),
        'subjects': subjects,
    })

@login_required
@require_POST
def add_timetable_subject_api(request):
    """Add a subject manually to the timetable"""
    try:
        data = json.loads(request.body)
        subject_name = data.get('subject_name', '').strip()
        professor = data.get('professor', '').strip()
        classroom = data.get('classroom', '').strip()
        day_of_week = int(data.get('day_of_week'))
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')

        if not subject_name or day_of_week not in range(5) or not start_time_str or not end_time_str:
            return JsonResponse({'success': False, 'error': '필수 항목이 올바르지 않습니다.'}, status=400)

        # Parse times
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()

        if start_time >= end_time:
            return JsonResponse({'success': False, 'error': '시작 시간은 종료 시간보다 빨라야 합니다.'}, status=400)

        # Check for overlaps
        overlapping = TimetableSubject.objects.filter(
            user=request.user,
            day_of_week=day_of_week,
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exists()

        if overlapping:
            return JsonResponse({'success': False, 'error': '해당 시간에 이미 등록된 과목이 있습니다.'}, status=400)

        color = get_pastel_color(subject_name)
        subject = TimetableSubject.objects.create(
            user=request.user,
            subject_name=subject_name,
            professor=professor,
            classroom=classroom,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            color=color
        )

        return JsonResponse({
            'success': True,
            'subject': {
                'id': subject.id,
                'subject_name': subject.subject_name,
                'professor': subject.professor,
                'classroom': subject.classroom,
                'day_of_week': subject.day_of_week,
                'start_time': subject.start_time.strftime('%H:%M'),
                'end_time': subject.end_time.strftime('%H:%M'),
                'color': subject.color
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@require_POST
def delete_timetable_subject_api(request, subject_id):
    """Delete a subject from the timetable"""
    subject = get_object_or_404(TimetableSubject, id=subject_id, user=request.user)
    subject.delete()
    return JsonResponse({'success': True})

@login_required
@require_POST
def import_everytime_timetable_api(request):
    """Import timetable from Everytime share URL"""
    try:
        data = json.loads(request.body)
        share_url = data.get('url', '').strip()
        if not share_url:
            return JsonResponse({'success': False, 'error': '공유 URL을 입력해 주세요.'}, status=400)

        # Extract identifier
        # everytime.kr/share/timetable/image?identifier=XYZ or everytime.kr/@XYZ or XYZ
        identifier = ""
        print(f"DEBUG: share_url entered = {share_url}")
        if 'everytime.kr' in share_url:
            match = re.search(r'(?:identifier=|\/@)([a-zA-Z0-9]+)', share_url)
            if match:
                identifier = match.group(1)
        else:
            match = re.match(r'^[a-zA-Z0-9]+$', share_url)
            if match:
                identifier = share_url

        print(f"DEBUG: extracted identifier = {identifier}")
        if not identifier:
            return JsonResponse({'success': False, 'error': '올바른 에브리타임 공유 URL 또는 식별자가 아닙니다.'}, status=400)

        # Call Everytime XML API with unverified SSL context (New POST Endpoint)
        api_url = "https://api.everytime.kr/find/timetable/table/friend"
        print(f"DEBUG: calling api_url = {api_url} with identifier = {identifier}")
        
        post_payload = urllib.parse.urlencode({
            'identifier': identifier,
            'friendInfo': 'true'
        }).encode('utf-8')
        
        req = urllib.request.Request(
            api_url,
            data=post_payload,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://everytime.kr/",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method="POST"
        )
        
        try:
            context = ssl._create_unverified_context()
            with urllib.request.urlopen(req, context=context, timeout=10) as response:
                xml_data = response.read()
        except urllib.error.HTTPError as he:
            traceback.print_exc()
            if he.code == 404:
                return JsonResponse({'success': False, 'error': '에브리타임에서 해당 시간표를 찾을 수 없습니다. (식별자 오류)'}, status=400)
            elif he.code == 403:
                return JsonResponse({'success': False, 'error': '에브리타임 서버에서 접근이 거부되었습니다.'}, status=403)
            return JsonResponse({'success': False, 'error': f'에브리타임 서버 오류 (HTTP {he.code})'}, status=400)
        except urllib.error.URLError as ue:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': '에브리타임 서버에 연결할 수 없습니다. 네트워크 연결 상태를 확인해 주세요.'}, status=400)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': f'네트워크 요청 중 알 수 없는 오류 발생: {str(e)}'}, status=400)

        try:
            root = ET.fromstring(xml_data)
        except ET.ParseError as pe:
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': '받아온 시간표 데이터(XML) 형식이 유효하지 않습니다.'}, status=400)

        imported_subjects = []

        with transaction.atomic():
            # Delete existing timetable subjects for clean import
            TimetableSubject.objects.filter(user=request.user).delete()

            # New XML root is <table> containing <subject> nodes
            for subject_node in root.findall(".//subject"):
                name = subject_node.find("name").attrib.get("value", "") if subject_node.find("name") is not None else ""
                
                prof_node = subject_node.find("professor")
                professor = prof_node.attrib.get("value", "") if prof_node is not None else ""
                
                place_node = subject_node.find("place")
                place = place_node.attrib.get("value", "") if place_node is not None else ""
                
                time_node = subject_node.find("time")
                if time_node is not None:
                    for data_node in time_node.findall("data"):
                        day = int(data_node.attrib.get("day"))
                        
                        # 에브리타임 시간표는 월~금만 지원 (0: 월 ~ 4: 금)
                        if day > 4:
                            continue # Skip weekend subjects for simple grid layout
                            
                        # New XML attributes are starttime and endtime
                        start = int(data_node.attrib.get("starttime"))
                        end = int(data_node.attrib.get("endtime"))
                        
                        data_place = data_node.attrib.get("place", "")
                        classroom = data_place if data_place else place
                        
                        # Conversion from 5-min index to time
                        start_minutes = start * 5
                        end_minutes = end * 5
                        
                        start_time = time(start_minutes // 60, start_minutes % 60)
                        end_time = time(end_minutes // 60, end_minutes % 60)
                        
                        color = get_pastel_color(name)
                        
                        subject = TimetableSubject.objects.create(
                            user=request.user,
                            subject_name=name,
                            professor=professor,
                            classroom=classroom,
                            day_of_week=day,
                            start_time=start_time,
                            end_time=end_time,
                            color=color
                        )
                        imported_subjects.append({
                            'id': subject.id,
                            'subject_name': subject.subject_name,
                            'professor': subject.professor,
                            'classroom': subject.classroom,
                            'day_of_week': subject.day_of_week,
                            'start_time': subject.start_time.strftime('%H:%M'),
                            'end_time': subject.end_time.strftime('%H:%M'),
                            'color': subject.color
                        })

        return JsonResponse({
            'success': True,
            'message': f'성공적으로 {len(imported_subjects)}개의 수업 정보를 동기화했습니다.',
            'subjects': imported_subjects
        })
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({'success': False, 'error': f'가져오기 중 오류가 발생했습니다: {str(e)}'}, status=500)
