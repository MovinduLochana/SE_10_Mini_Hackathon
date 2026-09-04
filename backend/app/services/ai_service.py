import logging
import re
from typing import Tuple, List
from app.core.config import settings
from app.models.ai import CopyGenerationResponse, CategorySuggestionResponse

logger = logging.getLogger(__name__)

import random

# Sri Lankan Category Keyword Heuristic Map
CATEGORY_PATTERNS = {
    "Grocery & food": [
        "cinnamon", "kurundu", "pepper", "gam miris", "cardamom", "clove", "karabu",
        "goraka", "turmeric", "kaha", "curry powder", "thunapaha", "chili", "miris",
        "cumin", "suduru", "fenugreek", "uluhal", "nutmeg", "sadikka", "spice",
        "banana", "kesel", "mango", "avocado", "papaya", "coconut", "pol", "gotukola",
        "mukunuwenna", "dambala", "drumstick", "murunga", "vegetable", "fruit", "leaf",
        "fresh", "organic green", "lime", "dehi", "pickle", "achcharu", "chutney",
        "seeni sambol", "lunu miris", "pol sambol", "paste", "homemade", "sauce",
        "chili paste", "jam", "preserved", "tea", "ceylon tea", "coffee", "king coconut",
        "thambili", "herbal", "kothalahimbutu", "belimal", "ranawara", "drink", "juice",
        "beverage", "roast paan", "bun", "samosa", "pastry", "patty", "roti", "bread",
        "pol roti", "short eats", "kithul", "treacle", "pani", "jaggery", "hakuru",
        "kavum", "kokis", "dodol", "thala", "aluwa", "halapa", "pani walalu", "muscat",
        "sweet", "dessert", "grocery", "food"
    ],
    "Fashion & apparel": [
        "shirt", "t-shirt", "trouser", "dress", "saree", "sarong", "batik", "handloom",
        "shoes", "clothes", "apparel", "fashion", "wear", "garment", "clothing"
    ],
    "Electronics": [
        "phone", "mobile", "laptop", "computer", "tv", "television", "radio", "speaker",
        "earphone", "headphone", "charger", "cable", "battery", "electronic", "gadget",
        "device", "gaming", "tech", "smart", "digital", " gadget", "electronic", "smart"
    ],
    "Handmade & crafts": [
        "mask", "clay", "pottery", "brass", "coir", "cane", "woven", "wood carving",
        "craft", "handmade", "art", "sculpture", "painting"
    ],
    "Hardware & tools": [
        "tool", "hardware", "hammer", "nail", "screw", "drill", "saw", "pipe",
        "cement", "paint", "brush", "construction", "building", "repair"
    ],
    "Beauty & wellness": [
        "soap", "cream", "lotion", "perfume", "makeup", "cosmetic", "ayurvedic",
        "herbal", "oil", "massage", "wellness", "beauty", "skin", "hair", "shampoo"
    ]
}

def generate_local_marketing_pitch(title: str, keywords: str) -> Tuple[str, List[str]]:
    """
    Sri Lankan market-optimized dynamic pitch generator fallback.
    """
    clean_notes = [n.strip() for n in re.split(r"[,;•\n]", keywords) if n.strip()]
    notes_str = ", ".join(clean_notes) if clean_notes else "authentic local quality"
    
    templates = [
        f"Handcrafted with care, our {title} brings you the finest Sri Lankan goodness featuring {notes_str}. Perfect for your household or gifting, guaranteed to deliver pure traditional flavor and freshness straight to your doorstep.",
        f"Discover the unique taste and quality of {title}. Made with {notes_str}, it's an authentic Sri Lankan experience that you will absolutely love.",
        f"Elevate your lifestyle with {title}! Highlighting {notes_str}, this product is sourced locally and packed with care just for you.",
        f"Introducing {title} – the perfect blend of tradition and quality. With {notes_str}, this is a must-have for anyone who appreciates genuine local products.",
        f"Experience the premium quality of {title}, specially crafted for you. Enhanced with {notes_str}, it promises satisfaction with every purchase.",
        f"Looking for something special? Our {title} is just what you need! Featuring {notes_str}, it offers unmatched value and authentic local charm.",
        f"Treat yourself to {title}, a product that truly stands out. Made with {notes_str}, it is the perfect choice for everyday excellence.",
        f"Unlock the best of Sri Lanka with our top-rated {title}. Showcasing {notes_str}, it is designed to meet the highest standards of quality.",
        f"Your search for the perfect item ends here with {title}. Featuring {notes_str}, this product is trusted by locals for its reliability and excellence.",
        f"Step up your game with the incredible {title}. Boasting {notes_str}, it brings you exceptional quality right from the heart of our community.",
        f"Bring home the magic of {title} today! Characterized by {notes_str}, it is carefully prepared to ensure you get nothing but the best.",
        f"Don't miss out on {title}, a true local favorite! Made to perfection with {notes_str}, it's exactly what you've been looking for.",
        f"Get ready to be amazed by {title}. Featuring {notes_str}, it combines modern convenience with traditional Sri Lankan values.",
        f"Why settle for less when you can have {title}? Enhanced by {notes_str}, it is the ultimate addition to your daily routine.",
        f"Experience pure joy with our highly sought-after {title}. Highlights include {notes_str}, ensuring a delightful experience every single time."
    ]
    pitch = random.choice(templates)
    
    highlights = clean_notes[:4] if clean_notes else ["100% Local", "Freshly Packed", "Direct from Vendor"]
    return pitch, highlights

def suggest_category_locally(title: str, description: str = "") -> Tuple[str, List[str], float]:
    """
    Categorizes product based on title and description keywords.
    """
    combined_text = f"{title} {description}".lower()
    matches = []

    for category, keywords in CATEGORY_PATTERNS.items():
        score = sum(1 for kw in keywords if re.search(rf"\b{re.escape(kw)}\b", combined_text))
        if score > 0:
            matches.append((category, score))

    if matches:
        matches.sort(key=lambda x: x[1], reverse=True)
        best_category = matches[0][0]
        alternatives = [m[0] for m in matches[1:3]]
        return best_category, alternatives, 0.92

    return "Other", ["Grocery & food", "Handmade & crafts"], 0.60

async def generate_marketing_copy(title: str, keywords: str) -> CopyGenerationResponse:
    """
    Generates a compelling 2-sentence marketing pitch using Gemini API if configured,
    or falls back to the local Sri Lankan copywriting engine.
    """
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = (
                f"You are a marketing copywriter for Sri Lankan micro-merchants on PolaLink LK. "
                f"Write a compelling and dynamic marketing pitch (1 to 3 sentences) for the following product to appeal to Sri Lankan buyers.\n"
                f"Product Title: {title}\n"
                f"Merchant Notes: {keywords}\n"
                f"CRITICAL RULES:\n"
                f"- Make the description natural and vary the starting phrases so they don't sound repetitive.\n"
                f"- Ensure the description strictly matches the product's actual category (e.g., do not use food-related descriptions for electronics).\n"
                f"- Identify if a brand is mentioned. If so, ONLY include details related to the mentioned item and its brand. Do not invent unrelated features.\n"
                f"Return ONLY the pitch."
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            text = response.text.strip() if response and response.text else ""
            if text:
                clean_notes = [n.strip() for n in re.split(r"[,;•\n]", keywords) if n.strip()]
                return CopyGenerationResponse(
                    title=title,
                    marketing_pitch=text,
                    highlights=clean_notes[:4],
                    generated_by="Google Gemini 2.5"
                )
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to local heuristic: {e}")

    pitch, highlights = generate_local_marketing_pitch(title, keywords)
    return CopyGenerationResponse(
        title=title,
        marketing_pitch=pitch,
        highlights=highlights,
        generated_by="PolaLink Local AI Engine"
    )

async def suggest_category(title: str, description: str = "") -> CategorySuggestionResponse:
    """
    Suggests the best category tag for a product title.
    """
    suggested, alts, confidence = suggest_category_locally(title, description)
    return CategorySuggestionResponse(
        title=title,
        suggested_category=suggested,
        alternative_categories=alts,
        confidence=confidence
    )
