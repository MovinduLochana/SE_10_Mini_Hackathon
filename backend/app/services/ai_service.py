import logging
import re
from typing import Tuple, List
from app.core.config import settings
from app.models.ai import CopyGenerationResponse, CategorySuggestionResponse

logger = logging.getLogger(__name__)

# Sri Lankan Category Keyword Heuristic Map
CATEGORY_PATTERNS = {
    "Spices": [
        "cinnamon", "kurundu", "pepper", "gam miris", "cardamom", "clove", "karabu",
        "goraka", "turmeric", "kaha", "curry powder", "thunapaha", "chili", "miris",
        "cumin", "suduru", "fenugreek", "uluhal", "nutmeg", "sadikka", "spice"
    ],
    "Sweets": [
        "kithul", "treacle", "pani", "jaggery", "hakuru", "kavum", "kokis", "dodol",
        "thala", "aluwa", "halapa", "pani walalu", "muscat", "sweet", "dessert"
    ],
    "Fresh Produce": [
        "banana", "kesel", "mango", "avocado", "papaya", "coconut", "pol", "gotukola",
        "mukunuwenna", "dambala", "drumstick", "murunga", "vegetable", "fruit", "leaf",
        "fresh", "organic green", "lime", "dehi"
    ],
    "Homemade": [
        "pickle", "achcharu", "chutney", "seeni sambol", "lunu miris", "pol sambol",
        "paste", "homemade", "sauce", "chili paste", "jam", "preserved"
    ],
    "Beverages": [
        "tea", "ceylon tea", "coffee", "king coconut", "thambili", "herbal", "kothalahimbutu",
        "belimal", "ranawara", "drink", "juice", "beverage"
    ],
    "Handicrafts": [
        "batik", "mask", "clay", "pottery", "handloom", "brass", "coir", "cane",
        "woven", "wood carving", "craft"
    ],
    "Bakery": [
        "roast paan", "bun", "samosa", "pastry", "patty", "roti", "bread", "pol roti", "short eats"
    ]
}

def generate_local_marketing_pitch(title: str, keywords: str) -> Tuple[str, List[str]]:
    """
    Sri Lankan market-optimized 2-sentence pitch generator fallback.
    """
    clean_notes = [n.strip() for n in re.split(r"[,;•\n]", keywords) if n.strip()]
    notes_str = ", ".join(clean_notes) if clean_notes else "authentic local quality"
    
    sentence_1 = f"Handcrafted with care, our {title} brings you the finest Sri Lankan goodness featuring {notes_str}."
    sentence_2 = "Perfect for your household or gifting, guaranteed to deliver pure traditional flavor and freshness straight to your doorstep."

    pitch = f"{sentence_1} {sentence_2}"
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

    return "Homemade", ["Spices", "Fresh Produce"], 0.60

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
                f"Write exactly a compelling 2-sentence marketing pitch for the following product to appeal to Sri Lankan buyers.\n"
                f"Product Title: {title}\n"
                f"Merchant Notes: {keywords}\n"
                f"Return ONLY the 2 sentences."
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
