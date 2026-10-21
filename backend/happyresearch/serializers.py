"""Turning rows into the JSON the frontend expects."""
from . import storage
from .models import Teacher


def teacher_json(teacher, view="public"):
    """view: "public" (anyone), "owner" (the mentor themselves) or "admin"."""
    if view == "public":
        data = {k: v for k, v in teacher.to_dict().items() if k in Teacher.PUBLIC}
    else:
        data = teacher.to_dict()
    for field in Teacher.FILE_FIELDS:
        if field in data:
            data[field] = storage.file_url(data[field])
    return data


def showcase_json(entry):
    data = entry.to_dict()
    if "fileUrl" in data:
        data["fileUrl"] = storage.file_url(data["fileUrl"])
    return data


def rows(items, fn=None):
    return [fn(i) if fn else i.to_dict() for i in items]
