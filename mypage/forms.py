from django import forms

from .models import PersonalDocument, PersonalFolder, Subject

CUSTOM_SUBJECT_VALUE = "__custom__"

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
    subject_code = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={"class": INPUT_CLASS, "id": "id_subject_code"}),
    )
    custom_subject_code = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            "class": INPUT_CLASS + " hidden",
            "id": "id_custom_subject_code",
            "placeholder": "새 강의 이름 입력",
        }),
    )
    custom_subject_display_code = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            "class": INPUT_CLASS + " hidden",
            "id": "id_custom_subject_display_code",
            "placeholder": "새 강의 코드 입력 (선택)",
        }),
    )
    document_type = forms.ChoiceField(
        choices=PersonalDocument.DocumentType.choices,
        required=False,
        widget=forms.Select(attrs={"class": INPUT_CLASS, "id": "id_document_type"}),
    )

    class Meta:
        model = PersonalDocument
        fields = ["title", "file", "subject_code", "document_type"]
        widgets = {
            "file": forms.FileInput(attrs={"accept": ",".join(ALLOWED_EXTENSIONS), "class": FILE_INPUT_CLASS}),
        }

    def __init__(self, *args, user=None, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
        choices = [("", "강의 선택")] + [(s.name, s.name) for s in Subject.objects.all()]
        if user is not None and user.is_superuser:
            choices.append((CUSTOM_SUBJECT_VALUE, "+ 새 강의 직접 입력"))
        self.fields["subject_code"].choices = choices

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("subject_code") == CUSTOM_SUBJECT_VALUE:
            if not self.user or not self.user.is_superuser:
                raise forms.ValidationError("새 강의를 추가할 권한이 없습니다.")
            name = cleaned_data.get("custom_subject_code", "").strip()
            if not name:
                raise forms.ValidationError("추가할 강의 이름을 입력해주세요.")
            code = cleaned_data.get("custom_subject_display_code", "").strip()
            Subject.objects.get_or_create(name=name, defaults={"code": code})
            cleaned_data["subject_code"] = name
        return cleaned_data

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
