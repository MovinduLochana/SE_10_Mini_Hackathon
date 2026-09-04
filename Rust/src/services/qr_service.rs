use base64::Engine;
use image::{ImageEncoder, Rgb, RgbImage};
use qrcode::{Color, EcLevel, QrCode};
use crate::error::AppError;

pub fn generate_qr_image_bytes(data: &str) -> Result<Vec<u8>, AppError> {
    let code = QrCode::with_error_correction_level(data.as_bytes(), EcLevel::M)
        .map_err(|e| AppError::internal(format!("QR generation error: {e}")))?;

    let qr_width = code.width();
    let border = 4;
    let box_size = 10;
    let total_modules = qr_width + border * 2;
    let img_dim = (total_modules * box_size) as u32;

    let dark = Rgb([15, 23, 42]);     // #0F172A
    let light = Rgb([255, 255, 255]); // #FFFFFF

    let mut img = RgbImage::from_pixel(img_dim, img_dim, light);

    for (i, color) in code.to_colors().into_iter().enumerate() {
        if color == Color::Dark {
            let x_mod = (i % qr_width) + border;
            let y_mod = (i / qr_width) + border;

            let start_x = (x_mod * box_size) as u32;
            let start_y = (y_mod * box_size) as u32;

            for px in 0..(box_size as u32) {
                for py in 0..(box_size as u32) {
                    img.put_pixel(start_x + px, start_y + py, dark);
                }
            }
        }
    }

    let mut bytes = Vec::new();
    let encoder = image::codecs::png::PngEncoder::new(&mut bytes);
    encoder
        .write_image(
            img.as_raw(),
            img_dim,
            img_dim,
            image::ExtendedColorType::Rgb8,
        )
        .map_err(|e| AppError::internal(format!("PNG encoding error: {e}")))?;

    Ok(bytes)
}

pub fn generate_qr_data_url(data: &str) -> Result<String, AppError> {
    let bytes = generate_qr_image_bytes(data)?;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:image/png;base64,{encoded}"))
}
