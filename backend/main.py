import os
from typing import List, Dict
from datetime import datetime, timedelta

import httpx
import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load environment
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment")
openai.api_key = OPENAI_API_KEY

# Free Open Food Facts API
OFF_API_BASE = "https://world.openfoodfacts.org/api/v0/product"

app = FastAPI(title="SmartPantry API")

# CORS—allow requests from React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores
inventory: List["InventoryItem"] = []
budget_state: Dict[str, float] = {"monthly_budget": 0.0}


class InventoryItem(BaseModel):
    upc: str
    name: str = None
    purchase_price: float = None
    store: str = None
    quantity: int = Field(1, ge=1)
    expiry: datetime = None
    nutrition: Dict[str, float] = {}


class Budget(BaseModel):
    monthly_budget: float = Field(..., gt=0)


class MealPlanRequest(BaseModel):
    days: int = Field(..., gt=0, le=14)
    members: int = Field(..., gt=0)


# Budget endpoints
@app.post("/budget")
async def set_budget(b: Budget):
    budget_state["monthly_budget"] = b.monthly_budget
    return {"monthly_budget": b.monthly_budget}


@app.get("/budget")
async def get_budget():
    return {"monthly_budget": budget_state["monthly_budget"]}


# Inventory endpoints
@app.post("/inventory", response_model=InventoryItem)
async def add_inventory(item: InventoryItem):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{OFF_API_BASE}/{item.upc}.json", timeout=10)
        data = resp.json().get("product", {})
    if not data:
        raise HTTPException(status_code=404, detail="Product not found")
    item.name = data.get("product_name", item.name) or "Unknown product"
    item.nutrition = data.get("nutriments", {})
    item.expiry = datetime.utcnow() + timedelta(days=180)
    inventory.append(item)
    return item


@app.get("/inventory", response_model=List[InventoryItem])
async def list_inventory():
    return inventory


@app.delete("/inventory/{upc}")
async def remove_inventory(
    upc: str,
    quantity: int = Query(1, ge=1)
):
    """
    Remove up to `quantity` items matching `upc` from the in-memory inventory.
    """
    removed = 0
    new_list = []
    for item in inventory:
        if item.upc == upc and removed < quantity:
            removed += 1
            continue
        new_list.append(item)

    if removed == 0:
        raise HTTPException(status_code=404, detail="No such item to remove")

    inventory[:] = new_list
    return {"removed": removed}


@app.delete("/inventory")
async def clear_inventory():
    """
    Clears out the entire in-memory pantry.
    """
    inventory.clear()
    return {"cleared": True}


# OpenAI helper
def call_openai(prompt: str, system: str) -> str:
    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )
    return resp.choices[0].message.content.strip()


@app.post("/mealplan")
async def meal_plan(req: MealPlanRequest):
    items = [
        {"name": it.name, "qty": it.quantity, "expiry": it.expiry.strftime("%Y-%m-%d")}
        for it in inventory
    ]
    prompt = (
        f"Pantry items:\n{items}\n\n"
        f"Plan {req.days} days of balanced, budget-aware meals for {req.members} people, "
        "using only these items, minimizing waste and cost."
    )
    plan = call_openai(prompt, system="You are a meal-planning expert.")
    return {"meal_plan": plan}


@app.get("/whatcanieat")
async def what_can_i_eat():
    names = [it.name for it in inventory]
    prompt = f"I have these items: {names}. List all possible full meals."
    options = call_openai(prompt, system="You are a creative chef.")
    return {"options": options}


@app.get("/tips")
async def waste_tips():
    names = [it.name for it in inventory]
    prompt = f"Suggest practical waste-reduction tips for these items: {names}."
    tips = call_openai(prompt, system="You are an eco-friendly cooking coach.")
    return {"tips": tips}
