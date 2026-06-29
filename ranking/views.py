from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count
from django.shortcuts import render, redirect
from django.utils import timezone
from datetime import timedelta

from accounts.models import Attendance, get_attendance_streak
from contest.models import Contest, ContestParticipant, ContestSubmission
from .utils import (
	get_problem_points_map,
)


@login_required
def ranking_home(request):
	User = get_user_model()

	board = request.GET.get("board", "problems").strip()
	query = request.GET.get("q", "").strip()
	season = request.GET.get("season", "").strip()

	allowed_boards = {"problems", "contest", "leaves", "attendance", "streak"}
	if board not in allowed_boards:
		board = "problems"

	now = timezone.now()
	contest_ranking_enabled = Contest.objects.filter(
		is_active=True,
		start_time__lte=now,
		end_time__gte=now,
	).exists()

	if board == "contest" and not contest_ranking_enabled:
		messages.info(request, "현재 진행 중인 대회가 없어 대회 랭킹은 비활성화 상태입니다.")
		return redirect("ranking:home")

	BOARD_LABELS = {
		"problems": "문제 랭킹",
		"contest": "대회 랭킹",
		"leaves": "낙엽 랭킹",
		"attendance": "출석 랭킹",
		"streak": "연속 출석 랭킹",
	}
	board_label = BOARD_LABELS.get(board, "문제 랭킹")

	if board == "problems":
		users = User.objects.filter(is_active=True).select_related("student")

		if query:
			users = users.filter(
				Q(username__icontains=query) | Q(student__nickname__icontains=query)
			)

		users = list(users)
		user_ids = [user.id for user in users]
		problem_points_map = get_problem_points_map(user_ids)

		ranking_rows = []
		for user in users:
			problem_points = problem_points_map.get(user.id, 0)
			ranking_rows.append(
				{
					"user": user,
					"score": problem_points,
					"solved_count": user.solve_records.filter(status="SOLVED").count(),
				}
			)

		ranking_rows = [row for row in ranking_rows if row["solved_count"] > 0]
		ranking_rows.sort(key=lambda row: (-row["score"], row["user"].username.lower()))

		context = {
			"board": board,
			"board_label": board_label,
			"query": query,
			"contest_ranking_enabled": contest_ranking_enabled,
			"ranking_rows": ranking_rows,
			"top_rows": ranking_rows[:3],
		}
		return render(request, "ranking/ranking_home.html", context)

	if board == "leaves":
		users = User.objects.filter(is_active=True, leaves__gt=0).select_related("student")
		if query:
			users = users.filter(
				Q(username__icontains=query) | Q(student__nickname__icontains=query)
			)
		ranking_rows = [{"user": u, "score": u.leaves} for u in users]
		ranking_rows.sort(key=lambda r: (-r["score"], r["user"].username.lower()))

		context = {
			"board": board,
			"board_label": board_label,
			"query": query,
			"contest_ranking_enabled": contest_ranking_enabled,
			"ranking_rows": ranking_rows,
			"top_rows": ranking_rows[:3],
		}
		return render(request, "ranking/ranking_home.html", context)

	if board == "attendance":
		users_qs = User.objects.filter(is_active=True).select_related("student").annotate(
			total_attendance=Count("attendances")
		).filter(total_attendance__gt=0)
		if query:
			users_qs = users_qs.filter(
				Q(username__icontains=query) | Q(student__nickname__icontains=query)
			)
		ranking_rows = [{"user": u, "score": u.total_attendance} for u in users_qs]
		ranking_rows.sort(key=lambda r: (-r["score"], r["user"].username.lower()))

		context = {
			"board": board,
			"board_label": board_label,
			"query": query,
			"contest_ranking_enabled": contest_ranking_enabled,
			"ranking_rows": ranking_rows,
			"top_rows": ranking_rows[:3],
		}
		return render(request, "ranking/ranking_home.html", context)

	if board == "streak":
		kst_today = (timezone.now() + timedelta(hours=9)).date()
		users_qs = User.objects.filter(is_active=True).select_related("student")
		if query:
			users_qs = users_qs.filter(
				Q(username__icontains=query) | Q(student__nickname__icontains=query)
			)
		ranking_rows = []
		for u in users_qs:
			s = get_attendance_streak(u, kst_today)
			if s > 0:
				ranking_rows.append({"user": u, "score": s})
		ranking_rows.sort(key=lambda r: (-r["score"], r["user"].username.lower()))

		context = {
			"board": board,
			"board_label": board_label,
			"query": query,
			"contest_ranking_enabled": contest_ranking_enabled,
			"ranking_rows": ranking_rows,
			"top_rows": ranking_rows[:3],
		}
		return render(request, "ranking/ranking_home.html", context)

	season_queryset = Contest.objects.filter(is_active=True, start_time__lte=now).order_by("-start_time")
	selected_contest = None

	if season.isdigit():
		selected_contest = season_queryset.filter(pk=int(season)).first()

	if selected_contest is None:
		selected_contest = season_queryset.first()

	if selected_contest is None:
		messages.info(request, "표시할 대회 시즌이 없습니다.")
		return redirect("ranking:home")

	participant_rows = ContestParticipant.objects.filter(contest=selected_contest).select_related("user", "user__student")
	user_map = {participant.user_id: participant.user for participant in participant_rows}

	submissions_qs = ContestSubmission.objects.filter(contest=selected_contest)
	submission_user_ids = submissions_qs.values_list("user_id", flat=True).distinct()

	for user in User.objects.filter(id__in=submission_user_ids).select_related("student"):
		user_map[user.id] = user

	users = list(user_map.values())

	if query:
		query_lower = query.lower()
		filtered_users = []
		for user in users:
			nickname = ""
			if hasattr(user, "student") and user.student and user.student.nickname:
				nickname = user.student.nickname
			if query_lower in user.username.lower() or query_lower in nickname.lower():
				filtered_users.append(user)
		users = filtered_users

	contest_problems = selected_contest.contest_problems.select_related("problem").order_by("order", "id")
	ranking_rows = []

	for user in users:
		solved_count = 0
		penalty = 0

		for contest_problem in contest_problems:
			submissions = submissions_qs.filter(
				problem=contest_problem.problem,
				user=user,
			).order_by("submitted_at", "id")

			ac_submission = submissions.filter(result="AC").first()
			if not ac_submission:
				continue

			solved_count += 1
			wrong_attempts = submissions.filter(
				submitted_at__lt=ac_submission.submitted_at
			).exclude(result="AC").count()

			elapsed_minutes = int(
				(ac_submission.submitted_at - selected_contest.start_time).total_seconds() // 60
			)
			penalty += elapsed_minutes + (wrong_attempts * 20)

		ranking_rows.append(
			{
				"user": user,
				"score": solved_count,
				"penalty": penalty,
			}
		)

	ranking_rows.sort(
		key=lambda row: (
			-row["score"],
			row["penalty"],
			row["user"].username.lower(),
		)
	)

	context = {
		"board": board,
		"board_label": board_label,
		"query": query,
		"contest_ranking_enabled": contest_ranking_enabled,
		"season_queryset": season_queryset,
		"selected_season_id": selected_contest.id,
		"selected_contest": selected_contest,
		"ranking_rows": ranking_rows,
		"top_rows": ranking_rows[:3],
	}
	return render(request, "ranking/ranking_home.html", context)


@login_required
def community_ranking(request):
    """메인 도메인 전용 랭킹: 낙엽·출석·연속 출석 탭만 제공"""
    from django.contrib.auth import get_user_model
    from django.db.models import Q, Count
    from django.utils import timezone
    from datetime import timedelta
    from accounts.models import Attendance, get_attendance_streak

    User = get_user_model()
    board = request.GET.get("board", "leaves").strip()
    query = request.GET.get("q", "").strip()

    allowed_boards = {"leaves", "attendance", "streak"}
    if board not in allowed_boards:
        board = "leaves"

    BOARD_LABELS = {
        "leaves":     "낙엽 랭킹",
        "attendance": "출석 랭킹",
        "streak":     "연속 출석 랭킹",
    }
    board_label = BOARD_LABELS[board]

    ranking_rows = []

    if board == "leaves":
        qs = User.objects.filter(is_active=True, leaves__gt=0).select_related("student")
        if query:
            qs = qs.filter(Q(username__icontains=query) | Q(student__nickname__icontains=query))
        ranking_rows = [{"user": u, "score": u.leaves} for u in qs]
        ranking_rows.sort(key=lambda r: (-r["score"], r["user"].username.lower()))

    elif board == "attendance":
        qs = (
            User.objects.filter(is_active=True)
            .select_related("student")
            .annotate(total_attendance=Count("attendances"))
            .filter(total_attendance__gt=0)
        )
        if query:
            qs = qs.filter(Q(username__icontains=query) | Q(student__nickname__icontains=query))
        ranking_rows = [{"user": u, "score": u.total_attendance} for u in qs]
        ranking_rows.sort(key=lambda r: (-r["score"], r["user"].username.lower()))

    elif board == "streak":
        kst_today = (timezone.now() + timedelta(hours=9)).date()
        qs = User.objects.filter(is_active=True).select_related("student")
        if query:
            qs = qs.filter(Q(username__icontains=query) | Q(student__nickname__icontains=query))
        for u in qs:
            s = get_attendance_streak(u, kst_today)
            if s > 0:
                ranking_rows.append({"user": u, "score": s})
        ranking_rows.sort(key=lambda r: (-r["score"], r["user"].username.lower()))

    return render(request, "ranking/community_ranking.html", {
        "board": board,
        "board_label": board_label,
        "query": query,
        "ranking_rows": ranking_rows,
        "top_rows": ranking_rows[:3],
    })
