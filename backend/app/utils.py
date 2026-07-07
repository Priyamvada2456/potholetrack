import math
import os
import uuid


def haversine_meters(lat1, lon1, lat2, lon2):
    """
    Great-circle distance between two points in meters.
    Used for duplicate-pothole detection (is a new report within N meters
    of an existing open one?).
    """
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def allowed_file(filename, allowed_extensions):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in allowed_extensions
    )


def unique_filename(original_filename):
    ext = original_filename.rsplit(".", 1)[1].lower()
    return f"{uuid.uuid4().hex}.{ext}"


def save_upload(file_storage, upload_folder, allowed_extensions):
    """
    Validates and saves an uploaded photo. Returns the filename (not full path)
    so the caller can build a URL from it. Raises ValueError on bad input.
    """
    if file_storage is None or file_storage.filename == "":
        raise ValueError("No file provided")

    if not allowed_file(file_storage.filename, allowed_extensions):
        raise ValueError("File type not allowed. Use JPG, PNG, or WEBP.")

    os.makedirs(upload_folder, exist_ok=True)
    filename = unique_filename(file_storage.filename)
    filepath = os.path.join(upload_folder, filename)
    file_storage.save(filepath)
    return filename
