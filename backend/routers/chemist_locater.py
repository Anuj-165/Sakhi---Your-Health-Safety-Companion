import requests
import math
from fastapi import APIRouter, Query, Depends
from models import models
from routers.user import get_current_user 

router = APIRouter()

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate the distance in meters between two points on Earth."""
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.get("/nearby-chemist")
def get_nearby_chemist(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: int = 1000,
    current_user: models.User = Depends(get_current_user)
):
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # ✅ Fixed: Added closing triple quotes below
    query = f"""
    [out:json];
    node
      ["amenity"="pharmacy"]
      (around:{radius},{lat},{lon});
    out;
    """

    try:
        response = requests.get(overpass_url, params= {"data": query}, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        return {"error": "Could not connect to map service", "details": str(e)}
    
    results = []
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        
       
        dist = calculate_distance(lat, lon, element["lat"], element["lon"])
        
        results.append({
            "name": tags.get("name", "Unknown Pharmacy"),
            "lat": element["lat"],
            "lon": element["lon"],
            "address": tags.get("addr:full") or tags.get("addr:street", "Address not listed"),
            "distance_meters": round(dist)
        })
    
    # Sort by nearest first
    results.sort(key=lambda x: x["distance_meters"])
    
    return {
        "user": current_user.username,
        "center_point": {"lat": lat, "lon": lon},
        "nearby_chemists": results,
    }