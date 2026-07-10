from django import forms

from .models import PersonalDocument, PersonalFolder

MAX_UPLOAD_SIZE = 20 * 1024 * 1024
ALLOWED_EXTENSIONS = (".pdf", ".doc", ".docx", ".ppt", ".pptx")

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
    subject_code = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            "class": INPUT_CLASS,
            "placeholder": "과목 코드 (예: 소웨공) — 입력하면 자료가 쌓일 때 자동으로 강의가 생성됩니다",
        }),
    )

    class Meta:
        model = PersonalDocument
        fields = ["title", "file", "subject_code"]
        widgets = {
            "file": forms.FileInput(attrs={"accept": ".pdf,.doc,.docx,.ppt,.pptx", "class": FILE_INPUT_CLASS}),
        }

    def clean_file(self):
        f = self.cleaned_data.get("file")
        if f:
            if f.size > MAX_UPLOAD_SIZE:
                raise forms.ValidationError("파일 크기는 20MB를 넘을 수 없습니다.")
            if not any(f.name.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
                raise forms.ValidationError("PDF, DOC, DOCX, PPT, PPTX 파일만 업로드할 수 있습니다.")
        return f


class PersonalFolderForm(forms.ModelForm):
    class Meta:
        model = PersonalFolder
        fields = ["name"]
        widgets = {
            "name": forms.TextInput(attrs={"class": INPUT_CLASS, "placeholder": "새 폴더 이름"}),
        }
