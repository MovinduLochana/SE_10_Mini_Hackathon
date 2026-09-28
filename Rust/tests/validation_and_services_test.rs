use std::collections::HashMap;
use polalink_backend::{
    models::{
        order::OrderItemInput,
        product::{ProductCreate, StockBadge},
        store::{normalize_sl_phone, slugify, StoreCreate},
    },
    services::{
        ai_service::{generate_local_marketing_pitch, suggest_category_locally},
        order_service::process_order_calculation,
        qr_service::{generate_qr_data_url, generate_qr_image_bytes},
    },
};

#[test]
fn test_sri_lankan_phone_validation() {
    // Valid formats
    assert_eq!(normalize_sl_phone("0771234567").unwrap(), "94771234567");
    assert_eq!(normalize_sl_phone("+94712345678").unwrap(), "94712345678");
    assert_eq!(normalize_sl_phone("94749876543").unwrap(), "94749876543");
    assert_eq!(normalize_sl_phone("076 123 4567").unwrap(), "94761234567");
    assert_eq!(normalize_sl_phone("070-1122334").unwrap(), "94701122334");

    // Invalid formats
    assert!(normalize_sl_phone("0112345678").is_err()); // Landline
    assert!(normalize_sl_phone("0791234567").is_err()); // 079 is not SL mobile prefix
    assert!(normalize_sl_phone("12345").is_err());      // Too short
    assert!(normalize_sl_phone("abcdefghij").is_err()); // Non-numeric
}

#[test]
fn test_store_creation_validation() {
    let mut store = StoreCreate {
        name: "Galle Fort Antiques".to_string(),
        whatsapp_number: "0771234567".to_string(),
        description: Some("Authentic collectibles".to_string()),
        slug: None,
        category: None,
        location: None,
        logo_url: None,
        owner_name: None,
        initial_product: None,
    };
    assert!(store.validate_and_normalize().is_ok());
    assert_eq!(store.name, "Galle Fort Antiques");
    assert_eq!(store.whatsapp_number, "94771234567");

    // Test invalid phone rejection
    let mut invalid_store = StoreCreate {
        name: "Invalid Store".to_string(),
        whatsapp_number: "0115555555".to_string(),
        description: None,
        slug: None,
        category: None,
        location: None,
        logo_url: None,
        owner_name: None,
        initial_product: None,
    };
    assert!(invalid_store.validate_and_normalize().is_err());
}

#[test]
fn test_slugify() {
    assert_eq!(slugify("Ruhunu Spices & Herbs!"), "ruhunu-spices-herbs");
    assert_eq!(slugify("  Kandy   Kithul  "), "kandy-kithul");
}

#[test]
fn test_product_validation_rules() {
    // Valid product
    let mut prod = ProductCreate {
        title: "Pure Cinnamon (100g)".to_string(),
        description: None,
        price: 850.0,
        category: "Spices".to_string(),
        stock: 20,
        image_url: None,
        is_available: true,
    };
    assert!(prod.validate_and_normalize().is_ok());
    assert_eq!(prod.price, 850.0);
    assert_eq!(prod.stock, 20);
    assert_eq!(prod.category, "Spices");

    // Price must be > 0
    let mut zero_price_prod = ProductCreate {
        title: "Zero Price Product".to_string(),
        description: None,
        price: 0.0,
        category: "Spices".to_string(),
        stock: 10,
        image_url: None,
        is_available: true,
    };
    assert!(zero_price_prod.validate_and_normalize().is_err());

    // Stock must be >= 0
    let mut neg_stock_prod = ProductCreate {
        title: "Negative Stock Product".to_string(),
        description: None,
        price: 100.0,
        category: "Spices".to_string(),
        stock: -5,
        image_url: None,
        is_available: true,
    };
    assert!(neg_stock_prod.validate_and_normalize().is_err());
}

#[test]
fn test_stock_badges() {
    assert_eq!(StockBadge::compute(0, true), StockBadge::OUT_OF_STOCK);
    assert_eq!(StockBadge::compute(10, false), StockBadge::OUT_OF_STOCK);
    assert_eq!(StockBadge::compute(3, true), StockBadge::LOW_STOCK);
    assert_eq!(StockBadge::compute(15, true), StockBadge::IN_STOCK);
}

#[test]
fn test_qr_code_generation() {
    let test_url = "http://localhost:3000/store/ruhunu-spices";
    let png_bytes = generate_qr_image_bytes(test_url).unwrap();
    assert!(!png_bytes.is_empty());
    assert!(png_bytes.starts_with(b"\x89PNG")); // PNG Magic Number

    let data_url = generate_qr_data_url(test_url).unwrap();
    assert!(data_url.starts_with("data:image/png;base64,"));
}

#[test]
fn test_order_calculator_and_whatsapp_generation() {
    let store = serde_json::json!({
        "name": "Ruhunu Spices",
        "whatsapp_number": "94771234567"
    });

    let mut products = HashMap::new();
    products.insert(
        "prod-1".to_string(),
        serde_json::json!({
            "title": "Ceylon Cinnamon (100g)",
            "price": 850.0,
            "stock": 10,
            "is_available": true
        }),
    );
    products.insert(
        "prod-2".to_string(),
        serde_json::json!({
            "title": "Village Curry Powder (250g)",
            "price": 450.0,
            "stock": 20,
            "is_available": true
        }),
    );

    let items = vec![
        OrderItemInput {
            product_id: "prod-1".to_string(),
            quantity: 2,
        },
        OrderItemInput {
            product_id: "prod-2".to_string(),
            quantity: 1,
        },
    ];

    let res = process_order_calculation(
        &store,
        &products,
        &items,
        "Kasun Perera",
        "0712345678",
        "Near Galle Face, Colombo",
    );

    let expected_total = (850.0 * 2.0) + 450.0; // 2150.0
    assert_eq!(res.total_amount, expected_total);
    assert!(!res.has_stock_issues);
    assert_eq!(res.items.len(), 2);
    assert!(res.whatsapp_checkout_url.contains("https://wa.me/94771234567?text="));
    assert!(res.formatted_whatsapp_message.contains("Kasun Perera"));
    assert!(res.formatted_whatsapp_message.contains("Rs. 2,150.00"));
}

#[test]
fn test_order_calculator_with_stock_warnings() {
    let store = serde_json::json!({
        "name": "Test Store",
        "whatsapp_number": "94771234567"
    });

    let mut products = HashMap::new();
    products.insert(
        "prod-1".to_string(),
        serde_json::json!({
            "title": "Out of Stock Item",
            "price": 500.0,
            "stock": 0,
            "is_available": false
        }),
    );
    products.insert(
        "prod-2".to_string(),
        serde_json::json!({
            "title": "Low Stock Item",
            "price": 200.0,
            "stock": 2,
            "is_available": true
        }),
    );

    let items = vec![
        OrderItemInput {
            product_id: "prod-1".to_string(),
            quantity: 1,
        },
        OrderItemInput {
            product_id: "prod-2".to_string(),
            quantity: 5, // requests 5 but only 2 available
        },
    ];

    let res = process_order_calculation(&store, &products, &items, "", "", "");

    assert!(res.has_stock_issues);
    assert_eq!(res.stock_warnings.len(), 2);
    assert!(res.stock_warnings[0].contains("Out of Stock"));
    assert!(res.stock_warnings[1].contains("only has 2 items left in stock"));
}

#[test]
fn test_ai_copywriter_and_category_heuristics() {
    // Pitch generator
    let (pitch, highlights) = generate_local_marketing_pitch(
        "Pure Kithul Treacle",
        "organic, low sugar, traditional tapping",
    );
    assert!(pitch.contains("Pure Kithul Treacle"));
    assert!(pitch.contains("organic"));
    assert!(highlights.len() >= 2);

    // Categorization
    let (cat, _, _) = suggest_category_locally("Ceylon Alba Cinnamon Sticks", "");
    assert_eq!(cat, "Spices");

    let (cat2, _, _) = suggest_category_locally("Pure Kithul Treacle Bottle", "");
    assert_eq!(cat2, "Sweets");

    let (cat3, _, _) = suggest_category_locally("Homemade Katta Sambol", "");
    assert_eq!(cat3, "Homemade");
}
