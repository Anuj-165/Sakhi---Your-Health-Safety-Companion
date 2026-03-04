from fastapi import APIRouter, Depends, HTTPException, status
from schemas.requests import ChapterRequest
from models import edu_vector, models
from utils.helpers import ChapterCache
from utils.clean_chapter import clean_chapter
from core import config
import re
from utils.LocalLanguage import text_to_speech, safe_translate

from routers.user import get_current_user  
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

vectordb = edu_vector.load_edu_vectordb(config.EDU_INDEX_PATH, config.EDU_DOCS_PATH)
cache = ChapterCache(vectordb)


def categorize_chapter(chapter_name: str) -> str:
    """Categorize chapter by keywords in file name"""
    lower_name = chapter_name.lower()
    if "human reproduction" in lower_name:
        return "Human reproduction"
    elif "women rights" in lower_name or "legal rights" in lower_name:
        return "Women rights"
    elif "periods" in lower_name or "period education" in lower_name:
        return "Periods"
    else:
        return "Other"


def is_valid_chapter(content: list[str]) -> bool:
    """Filter out unwanted chapters like intros or empty ones"""
    if not content: return False
    text = " ".join(content).strip()
    if len(text.split()) < 15:
        return False
    lower_text = text.lower()
    if any(keyword in lower_text[:50] for keyword in ["introduction", "overview", "summary", "contents"]):
        return False
    return True


def group_small_chapters(chapters: list[dict], min_pages: int = 3) -> list[dict]:
    grouped = []
    buffer = None

    for ch in chapters:
        if buffer is None:
            buffer = {
                "chapter": ch["chapter"],
                "pages": ch["pages"],
                "content": ch["content"],
                "chapters": [ch["chapter"]],
            }
        else:
            buffer["chapter"] += f" + {ch['chapter']}"
            buffer["pages"] += ch["pages"]
            buffer["content"] += "\n\n" + ch["content"]
            buffer["chapters"].append(ch["chapter"])

        if buffer["pages"] >= min_pages:
            grouped.append(buffer)
            buffer = None

    if buffer:
        if grouped:
            grouped[-1]["chapter"] += f" + {buffer['chapter']}"
            grouped[-1]["pages"] += buffer["pages"]
            grouped[-1]["content"] += "\n\n" + buffer["content"]
            grouped[-1]["chapters"].extend(buffer["chapters"])
        else:
            grouped.append(buffer)

    return grouped


def cap_chapter_count(chapters: dict, max_total: int = 35) -> dict:
    all_items = []
    for cat, items in chapters.items():
        for item in items:
            item["category"] = cat
            all_items.append(item)

    all_items.sort(key=lambda x: x["pages"])

    while len(all_items) > max_total:
        first = all_items.pop(0)
        second = all_items.pop(0)

        merged = {
            "chapter": f"{first['chapter']} + {second['chapter']}",
            "pages": first["pages"] + second["pages"],
            "content": first["content"] + "\n\n" + second["content"],
            "chapters": first.get("chapters", [first["chapter"]]) + second.get("chapters", [second["chapter"]]),
            "category": first["category"],
        }
        all_items.append(merged)
        all_items.sort(key=lambda x: x["pages"])

    grouped = {}
    for item in all_items:
        grouped.setdefault(item["category"], []).append(item)

    return grouped


def add_headings(text: str) -> str:
    sections = re.split(r'(?i)(chapter|section|topic)\s+\d+', text)
    structured_text = "\n\n".join(
        [f"Section {i+1}:\n{sec.strip()}" for i, sec in enumerate(sections) if sec.strip()]
    )
    return structured_text




@router.get("/list")
def list_chapters_with_pages(
    lang: str = "en",
    current_user: models.User = Depends(get_current_user)
):
    chapters = cache.list_chapters()
    grouped = {}

    for ch in chapters:
        category = categorize_chapter(ch)
        content = cache.get_chapter(ch)
        if not is_valid_chapter(content):
            continue

        num_pages = len(content)
        grouped.setdefault(category, []).append({
            "chapter": ch,
            "pages": num_pages,
            "content": " ".join(content),
            "chapters": [ch],
        })

    for cat, items in grouped.items():
        grouped[cat] = group_small_chapters(items, min_pages=2)
    
    grouped = cap_chapter_count(grouped, max_total=35)

    result = {}
    total_chapters = 0
    for cat, items in grouped.items():
        items = sorted(items, key=lambda x: x["pages"], reverse=True)
        renamed_items = []
        for idx, i in enumerate(items, 1):
            
            chapter_name_en = f"{cat} - {idx}"

            if lang.lower() == "en":
                chapter_name = chapter_name_en
            else:
                chapter_name = safe_translate(chapter_name_en, to_lang=lang)

          
            cache.add_display_name(chapter_name.lower().strip(), i["chapters"])

            renamed_items.append({
                "chapter": chapter_name,
                "pages": i["pages"],
                "chapters": i["chapters"],
            })
        result[cat] = renamed_items
        total_chapters += len(renamed_items)

    return {
        "chapters": result, 
        "summary": {
            "total_chapters": total_chapters,
            "by_category": {cat: len(items) for cat, items in result.items()}
        }
    }


@router.post("/get-chapter")
def get_chapter(
    req: ChapterRequest,
    current_user: models.User = Depends(get_current_user)
):
    
    all_raw_content = cache.get_chapter(req.chapter)

    
    if not all_raw_content and req.lang != "en":
        search_name = safe_translate(req.chapter, to_lang="en")
        all_raw_content = cache.get_chapter(search_name)

    if not all_raw_content:
       
        formatted_key = req.chapter.replace(" ", "-").title()
        all_raw_content = cache.get_chapter(formatted_key)

    if not all_raw_content:
        raise HTTPException(
            status_code=404, 
            detail=f"Content for '{req.chapter}' could not be located."
        )

    
    raw_content_str = " ".join(all_raw_content)
    cleaned_content = clean_chapter(raw_content_str)
    structured_content_en = add_headings(cleaned_content)

    final_content = structured_content_en
    if req.lang != "en":
        final_content = safe_translate(structured_content_en, to_lang=req.lang)

    tts_file = text_to_speech(final_content, lang=req.lang, filename="chapter.mp3")

    return {
        "chapter": req.chapter,
        "content": final_content,
        "speech_file": tts_file
    }