use rand::seq::SliceRandom;
use regex::Regex;
use serde_json::Value;
use std::sync::LazyLock;
use crate::models::ai::{CategorySuggestionResponse, CopyGenerationResponse};

pub static CATEGORIES: &[(&str, &[&str])] = &[
    ("Spices", &[
        "cinnamon", "kurundu", "pepper", "gam miris", "cardamom", "clove", "karabu",
        "goraka", "turmeric", "kaha", "curry powder", "thunapaha", "chili", "miris",
        "cumin", "suduru", "fenugreek", "uluhal", "nutmeg", "sadikka", "spice",
    ]),
    ("Sweets", &[
        "kithul", "treacle", "pani", "jaggery", "hakuru", "kavum", "kokis", "dodol",
        "thala", "aluwa", "halapa", "pani walalu", "muscat", "sweet", "dessert",
    ]),
    ("Homemade", &[
        "pickle", "achcharu", "chutney", "seeni sambol", "lunu miris", "pol sambol",
        "katta sambol", "paste", "homemade", "sauce", "chili paste", "jam", "preserved",
    ]),
    ("Grocery & food", &[
        "banana", "kesel", "mango", "avocado", "papaya", "coconut", "pol", "gotukola",
        "mukunuwenna", "dambala", "drumstick", "murunga", "vegetable", "fruit", "leaf",
        "fresh", "organic green", "lime", "dehi", "tea", "ceylon tea", "coffee", "king coconut",
        "thambili", "herbal", "kothalahimbutu", "belimal", "ranawara", "drink", "juice",
        "beverage", "roast paan", "bun", "samosa", "pastry", "patty", "roti", "bread",
        "pol roti", "short eats", "grocery", "food",
    ]),
    ("Fashion & apparel", &[
        "shirt", "t-shirt", "trouser", "dress", "saree", "sarong", "batik", "handloom",
        "shoes", "clothes", "apparel", "fashion", "wear", "garment", "clothing",
    ]),
    ("Electronics", &[
        "phone", "mobile", "laptop", "computer", "tv", "television", "radio", "speaker",
        "earphone", "headphone", "charger", "cable", "battery", "electronic", "gadget",
        "device", "gaming", "tech", "smart", "digital",
    ]),
    ("Handmade & crafts", &[
        "mask", "clay", "pottery", "brass", "coir", "cane", "woven", "wood carving",
        "craft", "handmade", "art", "sculpture", "painting",
    ]),
    ("Hardware & tools", &[
        "tool", "hardware", "hammer", "nail", "screw", "drill", "saw", "pipe",
        "cement", "paint", "brush", "construction", "building", "repair",
    ]),
    ("Beauty & wellness", &[
        "soap", "cream", "lotion", "perfume", "makeup", "cosmetic", "ayurvedic",
        "herbal", "oil", "massage", "wellness", "beauty", "skin", "hair", "shampoo",
    ]),
];

static SPLIT_NOTES_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"[,;•\n]").unwrap()
});

pub fn extract_highlights(keywords: &str) -> (String, Vec<String>) {
    let clean_notes: Vec<String> = SPLIT_NOTES_REGEX
        .split(keywords)
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    let notes_str = if clean_notes.is_empty() {
        "authentic local quality".to_string()
    } else {
        clean_notes.join(", ")
    };

    let highlights = if clean_notes.is_empty() {
        vec![
            "100% Local".to_string(),
            "Freshly Packed".to_string(),
            "Direct from Vendor".to_string(),
        ]
    } else {
        clean_notes.iter().take(4).cloned().collect()
    };

    (notes_str, highlights)
}

pub fn generate_local_marketing_pitch(title: &str, keywords: &str) -> (String, Vec<String>) {
    let (notes_str, highlights) = extract_highlights(keywords);

    let templates = [
        format!("Handcrafted with care, our {title} brings you the finest Sri Lankan goodness featuring {notes_str}. Perfect for your household or gifting, guaranteed to deliver pure traditional flavor and freshness straight to your doorstep."),
        format!("Discover the unique taste and quality of {title}. Made with {notes_str}, it's an authentic Sri Lankan experience that you will absolutely love."),
        format!("Elevate your lifestyle with {title}! Highlighting {notes_str}, this product is sourced locally and packed with care just for you."),
        format!("Introducing {title} – the perfect blend of tradition and quality. With {notes_str}, this is a must-have for anyone who appreciates genuine local products."),
        format!("Experience the premium quality of {title}, specially crafted for you. Enhanced with {notes_str}, it promises satisfaction with every purchase."),
        format!("Looking for something special? Our {title} is just what you need! Featuring {notes_str}, it offers unmatched value and authentic local charm."),
        format!("Treat yourself to {title}, a product that truly stands out. Made with {notes_str}, it is the perfect choice for everyday excellence."),
        format!("Unlock the best of Sri Lanka with our top-rated {title}. Showcasing {notes_str}, it is designed to meet the highest standards of quality."),
        format!("Your search for the perfect item ends here with {title}. Featuring {notes_str}, this product is trusted by locals for its reliability and excellence."),
        format!("Step up your game with the incredible {title}. Boasting {notes_str}, it brings you exceptional quality right from the heart of our community."),
        format!("Bring home the magic of {title} today! Characterized by {notes_str}, it is carefully prepared to ensure you get nothing but the best."),
        format!("Don't miss out on {title}, a true local favorite! Made to perfection with {notes_str}, it's exactly what you've been looking for."),
        format!("Get ready to be amazed by {title}. Featuring {notes_str}, it combines modern convenience with traditional Sri Lankan values."),
        format!("Why settle for less when you can have {title}? Enhanced by {notes_str}, it is the ultimate addition to your daily routine."),
        format!("Experience pure joy with our highly sought-after {title}. Highlights include {notes_str}, ensuring a delightful experience every single time."),
    ];

    let mut rng = rand::thread_rng();
    let pitch = templates.choose(&mut rng).cloned().unwrap_or_else(|| templates[0].clone());

    (pitch, highlights)
}

pub fn suggest_category_locally(title: &str, description: &str) -> (String, Vec<String>, f64) {
    let combined = format!("{title} {description}").to_lowercase();
    let mut matches = Vec::new();

    for &(category, keywords) in CATEGORIES {
        let mut score = 0;
        for &kw in keywords {
            let pattern = format!(r"\b{}\b", regex::escape(kw));
            if let Ok(re) = Regex::new(&pattern) {
                if re.is_match(&combined) {
                    score += 1;
                }
            }
        }
        if score > 0 {
            matches.push((category.to_string(), score));
        }
    }

    if !matches.is_empty() {
        matches.sort_by(|a, b| b.1.cmp(&a.1));
        let best_category = matches[0].0.clone();
        let alternatives = matches
            .iter()
            .skip(1)
            .take(2)
            .map(|m| m.0.clone())
            .collect();
        return (best_category, alternatives, 0.92);
    }

    (
        "Other".to_string(),
        vec!["Grocery & food".to_string(), "Handmade & crafts".to_string()],
        0.60,
    )
}

pub async fn generate_marketing_copy(
    client: &reqwest::Client,
    gemini_api_key: &str,
    title: &str,
    keywords: &str,
) -> CopyGenerationResponse {
    if !gemini_api_key.trim().is_empty() {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_api_key}"
        );
        let prompt = format!(
            "You are a marketing copywriter for Sri Lankan micro-merchants on PolaLink LK. \
             Write a compelling and dynamic marketing pitch (1 to 3 sentences) for the following product to appeal to Sri Lankan buyers.\n\
             Product Title: {title}\n\
             Merchant Notes: {keywords}\n\
             CRITICAL RULES:\n\
             - Make the description natural and vary the starting phrases so they don't sound repetitive.\n\
             - Ensure the description strictly matches the product's actual category (e.g., do not use food-related descriptions for electronics).\n\
             - Identify if a brand is mentioned. If so, ONLY include details related to the mentioned item and its brand. Do not invent unrelated features.\n\
             Return ONLY the pitch."
        );

        let body = serde_json::json!({
            "contents": [
                {
                    "parts": [
                        { "text": prompt }
                    ]
                }
            ]
        });

        if let Ok(resp) = client.post(&url).json(&body).send().await {
            if resp.status().is_success() {
                if let Ok(json) = resp.json::<Value>().await {
                    if let Some(text) = json
                        .pointer("/candidates/0/content/parts/0/text")
                        .and_then(|v| v.as_str())
                    {
                        let trimmed = text.trim();
                        if !trimmed.is_empty() {
                            let (_, highlights) = extract_highlights(keywords);
                            return CopyGenerationResponse {
                                title: title.to_string(),
                                marketing_pitch: trimmed.to_string(),
                                highlights,
                                generated_by: "Google Gemini 2.5".to_string(),
                            };
                        }
                    }
                }
            }
        }
    }

    let (pitch, highlights) = generate_local_marketing_pitch(title, keywords);
    CopyGenerationResponse {
        title: title.to_string(),
        marketing_pitch: pitch,
        highlights,
        generated_by: "PolaLink Local AI Engine".to_string(),
    }
}

pub fn suggest_category(title: &str, description: &str) -> CategorySuggestionResponse {
    let (suggested, alts, confidence) = suggest_category_locally(title, description);
    CategorySuggestionResponse {
        title: title.to_string(),
        suggested_category: suggested,
        alternative_categories: alts,
        confidence,
    }
}
