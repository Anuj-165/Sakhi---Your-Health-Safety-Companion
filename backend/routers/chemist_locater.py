import requests
from fastapi import APIRouter, Query, Depends
from models import models


from routers.user import get_current_user  

router = APIRouter()


@router.get("/nearby-chemist")
def get_nearby_chemist(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: int = 1000,
    current_user: models.User = Depends(get_current_user)   # ✅ auth check
):
    
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    query = f"""
    [out:json];
    node
      ["amenity"="pharmacy"]
      (around:{radius},{lat},{lon});
    out;

    
    response = requests.get(overpass_url, params={"data": query})
    data = response.json()
    
    results = []
    for element in data.get("elements", []):
        results.append({
            "name": element.get("tags",{ "name": "Unknown" }).get("name", "Unknown"),
            "lat": element["lat"],
            "lon": element["lon"],
            "address": element.get("tags", { "addr:full": "Not available" }).get("addr:full", "Not available")
        })
    
    return {
        "user": current_user.username,   # ✅ optional: show who requested
        "nearby_chemists": results,
    }
