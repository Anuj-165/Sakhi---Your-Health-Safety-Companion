from fastapi import APIRouter, Depends
from pydantic import BaseModel
import joblib
import os
from utils.LocalLanguage import safe_translate  

from routers.user import get_current_user
from models.models import User  


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..")


risk_model = joblib.load(os.path.join(MODEL_DIR, "risk_model.pkl"))
risk_vectorizer = joblib.load(os.path.join(MODEL_DIR, "tfidf_risk.pkl"))

crime_model = joblib.load(os.path.join(MODEL_DIR, "crime_model.pkl"))
crime_vectorizer = joblib.load(os.path.join(MODEL_DIR, "tfidf_crime.pkl"))
crime_encoder = joblib.load(os.path.join(MODEL_DIR, "labelencoder_crime.pkl"))

subtype_model = joblib.load(os.path.join(MODEL_DIR, "subtype_model.pkl"))
subtype_vectorizer = joblib.load(os.path.join(MODEL_DIR, "tfidf_subtype.pkl"))
subtype_encoder = joblib.load(os.path.join(MODEL_DIR, "labelencoder_subtype.pkl"))


female_laws = {
    "harassment": {"law": "IPC Section 354A", "punishment": "Up to 3 years imprisonment or fine"},
    "stalking": {"law": "IPC Section 354D", "punishment": "Up to 3 years imprisonment"},
    "acid attack": {"law": "IPC Section 326A", "punishment": "Minimum 10 years, extendable to life"},
    "domestic violence": {"law": "Domestic Violence Act, 2005", "punishment": "Protective orders, imprisonment"},
    "dowry harassment": {"law": "Dowry Prohibition Act, 1961", "punishment": "Up to 5 years imprisonment"},
    "rape": {"law": "IPC Section 376", "punishment": "7 years to life imprisonment"},
    "kidnapping": {"law": "IPC Section 363", "punishment": "Up to 7 years imprisonment"},
    "human trafficking": {"law": "IPC Section 370", "punishment": "7 to 10 years imprisonment"},
    "cyberstalking": {"law": "IT Act Section 66E", "punishment": "Up to 3 years imprisonment"},
    "voyeurism": {"law": "IPC Section 354C", "punishment": "1 to 3 years imprisonment"},
    "sexual harassment at workplace": {"law": "POSH Act, 2013", "punishment": "Termination, fine, or imprisonment"},
}


keyword_mapping = {
    "eve-tease": "Harassment",
    "tease": "Harassment",
    "stalk": "Stalking",
    "follow": "Stalking",
    "gesture": "Harassment",
    "comment": "Harassment",
    "touch": "Harassment",
    "molest": "Harassment",
    "grab": "Harassment",
    "harass": "Harassment",
    "misbehave": "Harassment",
    "ogling": "Harassment",
    "catcall": "Harassment",
    "groped": "Harassment",
    "force": "Harassment",
}


niche_crime_mapping = {
    "dowry": "Dowry Harassment",
    "bride burning": "Dowry Harassment",
    "acid": "Acid Attack",
    "throw acid": "Acid Attack",
    "rape": "Rape",
    "sexual assault": "Rape",
    "force sex": "Rape",
    "kidnap": "Kidnapping",
    "abduct": "Kidnapping",
    "drag": "Kidnapping",
    "traffick": "Human Trafficking",
    "sell girl": "Human Trafficking",
    "forced marriage": "Human Trafficking",
    "cyber stalk": "Cyberstalking",
    "online harass": "Cyberstalking",
    "leaked photo": "Cyberstalking",
    "hidden camera": "Voyeurism",
    "video without consent": "Voyeurism",
}


story_mapping = {
    "taxi driver wrong way": "Kidnapping",
    "driver refused to stop": "Kidnapping",
    "stranger followed her at night": "Stalking",
    "someone kept calling and threatening": "Harassment",
    "colleague touched her in office": "Sexual Harassment at Workplace",
    "boss asked for sexual favor": "Sexual Harassment at Workplace",
    "neighbor secretly recorded video": "Voyeurism",
    "group of men teased on road": "Harassment",
    "man tried to drag her into car": "Kidnapping",
    "husband beat her at home": "Domestic Violence",
}


safe_mapping = ["market", "school", "festival", "friend", "home", "office"]


router = APIRouter()

class StoryRequest(BaseModel):
    story: str
    lang: str = "en"

class StoryResponse(BaseModel):
    risky: str
    risky_probability: float
    crime_type: str
    subtype: str
    law: str
    punishment: str
    crime_type_en: str
    subtype_en: str
    law_en: str
    punishment_en: str


@router.post("/analyze-story", response_model=StoryResponse)
def analyze_story(
    req: StoryRequest,
    current_user: User = Depends(get_current_user)  # ✅ requires auth
):
    print("Authenticated user:", current_user.username)

   
    try:
        story_en = safe_translate(req.story, "en", req.lang).lower()
    except Exception:
        story_en = req.story.lower()

    
    X_risk = risk_vectorizer.transform([story_en])
    proba = risk_model.predict_proba(X_risk)[0][1]
    risky_label = "yes" if proba > 0.32 else "no"

   
    crime_type_en, subtype_en = "Not available", "Not available"
    law_en, punishment_en = "Not available", "Not available"

    
    fallback_crimes = ["not available", "neutral", "potential risk / unknown", "safe / neutral"]

    if risky_label == "yes":
        X_crime = crime_vectorizer.transform([story_en])
        crime_probs = crime_model.predict_proba(X_crime)[0]
        crime_pred = crime_model.predict(X_crime)
        crime_type_en = crime_encoder.inverse_transform(crime_pred)[0]

        X_subtype = subtype_vectorizer.transform([story_en])
        subtype_pred = subtype_model.predict(X_subtype)
        subtype_en = subtype_encoder.inverse_transform(subtype_pred)[0]

        
        if crime_type_en.lower() in fallback_crimes:
            found = False
            for phrase, mapped_crime in story_mapping.items():
                if phrase in story_en:
                    crime_type_en = mapped_crime
                    found = True
                    break

            if not found:
                for keyword, mapped_crime in {**niche_crime_mapping, **keyword_mapping}.items():
                    if keyword in story_en:
                        crime_type_en = mapped_crime
                        found = True
                        break

            if not found:
                top_index = crime_probs.argmax()
                crime_type_en = crime_encoder.inverse_transform([top_index])[0]

        if subtype_en.lower() in ["not available", "neutral", "potential risk / unknown"]:
            subtype_en = "Potential Risk / Unknown"

        if crime_type_en.lower() in female_laws:
            law_info = female_laws[crime_type_en.lower()]
            law_en, punishment_en = law_info["law"], law_info["punishment"]
        else:
            law_en = "Protection under Women's Rights and Domestic Violence Laws"
            punishment_en = "Refer to local state/national laws for women's protection"
    else:
        if any(word in story_en for word in safe_mapping):
            crime_type_en, subtype_en = "Safe / Neutral", "Safe"
        else:
            crime_type_en, subtype_en = "Safe / Neutral", "Neutral"

    
    target_lang = req.lang
    if target_lang != "en":
        try:
            crime_type = safe_translate(crime_type_en, target_lang, "en")
            subtype = safe_translate(subtype_en, target_lang, "en")
            law = safe_translate(law_en, target_lang, "en")
            punishment = safe_translate(punishment_en, target_lang, "en")
        except Exception:
            crime_type, subtype, law, punishment = crime_type_en, subtype_en, law_en, punishment_en
    else:
        crime_type, subtype, law, punishment = crime_type_en, subtype_en, law_en, punishment_en

    return StoryResponse(
        risky=risky_label,
        risky_probability=proba,
        crime_type=crime_type,
        subtype=subtype,
        law=law,
        punishment=punishment,
        crime_type_en=crime_type_en,
        subtype_en=subtype_en,
        law_en=law_en,
        punishment_en=punishment_en
    )
 