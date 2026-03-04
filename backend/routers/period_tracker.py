from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime, timedelta, date, time
from sqlalchemy.orm import Session
from database import get_db
from models.models import PeriodCycle, User
from utils.LocalLanguage import safe_translate
import statistics
from zoneinfo import ZoneInfo 
from routers.user import get_current_user 

router = APIRouter()
IST = ZoneInfo("Asia/Kolkata")

# --- Pydantic Models ---
class PeriodRequest(BaseModel):
    last_period_date: date  # Pydantic will automatically parse "YYYY-MM-DD"
    cycle_length: int | None = None
    symptoms: list[str] = [] 
    lang: str = "en"

class PeriodResponse(BaseModel):
    next_period_date: str
    fertile_window_start: str
    fertile_window_end: str
    ovulation_day: str
    avg_cycle_length: int
    insights: list[str]

class RealtimeStatusResponse(BaseModel):
    now_ist: str
    day_of_cycle: int
    cycle_length: int
    phase: str
    days_until_next_period: int
    fertile_window_start: str
    fertile_window_end: str
    ovulation_day: str
    next_period_date: str
    tips: list[str]

class NotificationAlert(BaseModel):
    user_id: int
    username: str
    days_until: int
    message: str
    alert_type: str 

class QuickLogRequest(BaseModel):
    date: str | None = None      
    symptoms: list[str] = []
    flow: str | None = None      


def calculate_dynamic_cycle(user_id: int, db: Session, fallback: int = 28):
    cycles = db.query(PeriodCycle).filter(PeriodCycle.user_id == user_id).order_by(PeriodCycle.last_period_date.desc()).limit(6).all()
    if not cycles: return fallback
    lengths = [c.cycle_length for c in cycles if c.cycle_length]
    return round(statistics.mean(lengths)) if lengths else fallback

def determine_phase(day_of_cycle: int, cycle_len: int, period_len: int = 5) -> str:
    ovulation_day = max(1, cycle_len - 14)
    if 1 <= day_of_cycle <= period_len: return "menstruation"
    if day_of_cycle < ovulation_day: return "follicular"
    if day_of_cycle == ovulation_day: return "ovulation"
    return "luteal"

def compute_key_dates(last_period_dt: datetime, cycle_len: int):
    """Computes next period, ovulation, and fertility windows."""
    
    next_period = last_period_dt + timedelta(days=cycle_len)
    ovulation_day = next_period - timedelta(days=14)
    fertile_start = ovulation_day - timedelta(days=2)
    fertile_end = ovulation_day + timedelta(days=2)
    return next_period, ovulation_day, fertile_start, fertile_end



@router.post("/predict", response_model=PeriodResponse)
def predict_cycle(req: PeriodRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    last_period_dt = datetime.combine(req.last_period_date, time.min).replace(tzinfo=IST)

    cycle_length = req.cycle_length or calculate_dynamic_cycle(current_user.id, db)
    next_period, ovulation_day, fertile_start, fertile_end = compute_key_dates(last_period_dt, cycle_length)

    insights = []
    if cycle_length < 24 or cycle_length > 35:
        insights.append("Irregular cycle detected. Consider a medical check.")
    if "heavy flow" in req.symptoms:
        insights.append("Heavy flow noted. Watch for anemia.")
    if not insights: insights.append("Cycle looks normal.")

    
    existing = db.query(PeriodCycle).filter(
        PeriodCycle.user_id == current_user.id, 
        PeriodCycle.last_period_date == req.last_period_date
    ).first()

    if not existing:
        cycle = PeriodCycle(
            user_id=current_user.id,
            last_period_date=req.last_period_date,
            cycle_length=cycle_length,
            next_period_date=next_period.date(),
            ovulation_date=ovulation_day.date(),
            symptoms=",".join(req.symptoms)
        )
        db.add(cycle)
        db.commit()

    resp = PeriodResponse(
        next_period_date=next_period.date().isoformat(),
        fertile_window_start=fertile_start.date().isoformat(),
        fertile_window_end=fertile_end.date().isoformat(),
        ovulation_day=ovulation_day.date().isoformat(),
        avg_cycle_length=cycle_length,
        insights=insights
    )
    if req.lang != "en":
        resp.insights = [safe_translate(m, to_lang=req.lang) for m in resp.insights]
    return resp

@router.get("/status", response_model=RealtimeStatusResponse)
def real_time_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = datetime.now(IST)
    latest = db.query(PeriodCycle).filter(PeriodCycle.user_id == current_user.id).order_by(PeriodCycle.last_period_date.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No cycle data found.")

    
    last_period_dt = datetime.combine(latest.last_period_date, time.min).replace(tzinfo=IST)
    cycle_len = latest.cycle_length or 28

    
    while (now.date() - last_period_dt.date()).days >= cycle_len:
        last_period_dt += timedelta(days=cycle_len)

    next_period, ovulation_day, fertile_start, fertile_end = compute_key_dates(last_period_dt, cycle_len)
    day_of_cycle = (now.date() - last_period_dt.date()).days + 1
    phase = determine_phase(day_of_cycle, cycle_len)

    tips_map = {
        "menstruation": ["Rest well", "Hydrate", "Use heating pads"],
        "follicular": ["High energy phase", "Prioritize iron"],
        "ovulation": ["Fertility peak", "Watch for ovulation pain"],
        "luteal": ["PMS support", "Magnesium rich foods"]
    }

    return RealtimeStatusResponse(
        now_ist=now.isoformat(timespec="seconds"),
        day_of_cycle=day_of_cycle,
        cycle_length=cycle_len,
        phase=phase,
        days_until_next_period=max(0, (next_period.date() - now.date()).days),
        fertile_window_start=fertile_start.date().isoformat(),
        fertile_window_end=fertile_end.date().isoformat(),
        ovulation_day=ovulation_day.date().isoformat(),
        next_period_date=next_period.date().isoformat(),
        tips=tips_map.get(phase, [])
    )
    
    
@router.post("/log/")
def quick_log(req: QuickLogRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    latest = db.query(PeriodCycle).filter(PeriodCycle.user_id == current_user.id).order_by(PeriodCycle.last_period_date.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No cycle found. Please initialize your tracker first.")

    existing_symptoms = set((latest.symptoms or "").split(",")) if latest.symptoms else set()
    new_symptoms = set(req.symptoms or [])
    
    if req.flow:
        new_symptoms.add(f"flow:{req.flow}")

    merged_list = [s for s in sorted(existing_symptoms.union(new_symptoms)) if s]
    latest.symptoms = ",".join(merged_list)

    try:
        db.commit()
        db.refresh(latest)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update symptoms.")

    day_of_cycle = (datetime.now(IST).date() - latest.last_period_date).days + 1
    
    return {
        "status": "success",
        "current_symptoms": merged_list,
        "phase": determine_phase(day_of_cycle, latest.cycle_length or 28)
    }