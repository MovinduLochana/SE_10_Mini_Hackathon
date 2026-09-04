import io
import base64
import qrcode
from qrcode.image.pil import PilImage

def generate_qr_image_bytes(data: str) -> bytes:
    """
    Generates a high-quality PNG byte stream of a QR code encoding `data`.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img: PilImage = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()

def generate_qr_data_url(data: str) -> str:
    """
    Generates a Base64 Data URL for embedding directly into HTML or JSON responses.
    e.g. data:image/png;base64,...
    """
    png_bytes = generate_qr_image_bytes(data)
    encoded = base64.b64encode(png_bytes).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
