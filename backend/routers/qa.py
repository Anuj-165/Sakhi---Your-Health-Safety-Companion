# backend/routers/qa.py
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from schemas.requests import QuestionRequest
from models import edu_vector
from core import config
from database import get_db
from models.models import UserQuery
from utils.clean_answer import clean_answer  


from utils.LocalLanguage import speech_to_text, safe_translate, text_to_speech  
from routers.user import get_current_user  

import tempfile

router = APIRouter()


vectordb = edu_vector.load_edu_vectordb(config.EDU_INDEX_PATH, config.EDU_DOCS_PATH)


@router.post("/")
def ask_question(
    req: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),  
    top_k: int = 3
):
    """
    Multilingual Q&A (text input)
    """
    
    question_en = safe_translate(req.question, to_lang="en", from_lang=req.lang or "auto")

    
    raw_results = edu_vector.search_docs(vectordb, question_en, top_k=top_k)
    top_results = []
    if raw_results:
        for res in raw_results:
            text = clean_answer(question_en, res)
            top_results.append({"text": text})

    combined_text = " ".join([r["text"] for r in top_results]) if top_results else "Sorry, I have no info."
    final_answer_en = clean_answer(question_en, combined_text, top_results=[r["text"] for r in top_results])

    
    target_lang = req.lang if req.lang else "en"
    final_answer = (
        safe_translate(final_answer_en, to_lang=target_lang, from_lang="en")
        if target_lang != "en"
        else final_answer_en
    )

    
    tts_file = text_to_speech(final_answer, lang=target_lang, filename="answer.mp3")

   
    entry = UserQuery(user_id=current_user.id, query_text=req.question, answer_text=final_answer)
    db.add(entry)
    db.commit()

    return {
        "question": req.question,
        "answer": final_answer,
        "speech_file": tts_file,
        "top_results": top_results,
    }


@router.post("/speech-question")
async def ask_from_speech(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),   # ✅ check logged-in user
    top_k: int = 3
):
    """
    Multilingual Q&A (speech input)
    """
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    
    detected_text = speech_to_text(tmp_path)

   
    detected_lang = "auto"

    
    question_en = safe_translate(detected_text, to_lang="en", from_lang=detected_lang)

    
    raw_results = edu_vector.search_docs(vectordb, question_en, top_k=top_k)
    top_results = []
    if raw_results:
        for res in raw_results:
            text = clean_answer(question_en, res)
            top_results.append({"text": text})

    combined_text = " ".join([r["text"] for r in top_results]) if top_results else "Sorry, I have no info."
    final_answer_en = clean_answer(question_en, combined_text, top_results=[r["text"] for r in top_results])

    
    final_answer = (
        safe_translate(final_answer_en, to_lang=detected_lang, from_lang="en")
        if detected_lang != "en"
        else final_answer_en
    )

    
    tts_file = text_to_speech(final_answer, lang=detected_lang, filename="answer.mp3")

    
    entry = UserQuery(user_id=current_user.id, query_text=detected_text, answer_text=final_answer)
    db.add(entry)
    db.commit()

    return {
        "question_text": detected_text,
        "answer": final_answer,
        "speech_file": tts_file,
        "top_results": top_results,
    }
