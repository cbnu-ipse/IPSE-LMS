from django import forms
from .models import CourseCategory, Course, Upload, UploadVideo, Lesson

class CourseCategoryForm(forms.ModelForm):
    class Meta:
        model = CourseCategory
        fields = ['title', 'summary']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'summary': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['category', 'title', 'code', 'summary', 'instructor', 'thumbnail', 'enrollment_deadline']
        widgets = {
            'category': forms.Select(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'code': forms.TextInput(attrs={'class': 'form-control'}),
            'summary': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'instructor': forms.Select(attrs={'class': 'form-control'}),
            'enrollment_deadline': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }

class LecturerCourseForm(forms.ModelForm):
    """Lecturer self-service form — instructor field excluded, set in the view."""
    class Meta:
        model = Course
        fields = ['category', 'title', 'code', 'summary', 'thumbnail', 'enrollment_deadline']
        widgets = {
            'category': forms.Select(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'code': forms.TextInput(attrs={'class': 'form-control'}),
            'summary': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'enrollment_deadline': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }

class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 20}),
        }

class UploadForm(forms.ModelForm):
    class Meta:
        model = Upload
        fields = ['title', 'file']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'file': forms.FileInput(attrs={'class': 'form-control'}),
        }

class VideoUploadForm(forms.ModelForm):
    class Meta:
        model = UploadVideo
        fields = ['title', 'video', 'summary']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'video': forms.FileInput(attrs={'class': 'form-control'}),
            'summary': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
