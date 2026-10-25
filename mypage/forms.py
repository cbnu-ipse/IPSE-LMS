from django import forms

from .models import PersonalDocument, PersonalFolder


MAX_UPLOAD_SIZE = 20 * 1024 * 1024
ALLOWED_EXTENSIONS = (
    ".pdf", ".doc", ".docx", ".ppt", ".pptx",
    ".txt", ".md", ".rtf", ".hwp", ".hwpx",
    ".jpg", ".jpeg", ".png",
)

INPUT_CLASS = (
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 "
    "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 "
    "outline-none text-sm font-medium text-slate-700 transition-all duration-150"
)


FILE_INPUT_CLASS = (
    "flex-1 text-sm text-slate-500 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 "
    "file:mr-3 file:px-4 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-50 "
    "file:text-emerald-700 file:text-xs file:font-bold hover:file:bg-emerald-100 "
    "file:cursor-pointer cursor-pointer"
)


class PersonalDocumentUploadForm(forms.ModelForm):
    title = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={"class": INPUT_CLASS, "placeholder": "자료명 (비워두면 파일명 사용)"}),
    )
    # 자료 정보는 올릴 때 모두 입력한다 — 올린 뒤에는 고칠 수 없다 (분류·강의·출제 스타일이 이 정보로 정해지므로)
    document_type = forms.ChoiceField(
        choices=PersonalDocument.DocumentType.choices, initial=PersonalDocument.DocumentType.LECTURE, label="자료 구분",
        widget=forms.Select(attrs={"class": INPUT_CLASS}))
    course_name = forms.CharField(
        max_length=50, label="과목 이름",
        widget=forms.TextInput(attrs={"class": INPUT_CLASS, "placeholder": "과목 이름 (기존 과목은 목록에서 고르기)", "list": "subject-options",
                                   "autocomplete": "off"}))
    professor = forms.CharField(
        max_length=50, label="교수 이름",
        widget=forms.TextInput(attrs={"class": INPUT_CLASS, "placeholder": "교수 이름 (기존 교수님은 목록에서 고르기)", "list": "professor-options",
                                   "autocomplete": "off"}))

    class Meta:
        model = PersonalDocument
        # 수업 자료는 강의 생성에, 족보는 출제 스타일 학습에 쓰인다. 구분·과목·교수는 필수 (course/topics.py, mypage/exam.py)
        fields = ["title", "file", "document_type", "course_name", "professor"]
        widgets = {
            "file": forms.FileInput(attrs={"accept": ",".join(ALLOWED_EXTENSIONS), "class": FILE_INPUT_CLASS}),
        }

    def __init__(self, *args, user=None, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_file(self):
        f = self.cleaned_data.get("file")
        if f:
            if f.size > MAX_UPLOAD_SIZE:
                raise forms.ValidationError("파일 크기는 20MB를 넘을 수 없습니다.")
            if not any(f.name.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
                allowed = ", ".join(ext.lstrip(".").upper() for ext in ALLOWED_EXTENSIONS)
                raise forms.ValidationError(f"{allowed} 파일만 업로드할 수 있습니다.")
        return f


class PersonalFolderForm(forms.ModelForm):
    class Meta:
        model = PersonalFolder
        fields = ["name"]
        widgets = {
            "name": forms.TextInput(attrs={"class": INPUT_CLASS, "placeholder": "새 폴더 이름"}),
        }

