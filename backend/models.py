from pydantic import BaseModel, Field
from typing import List, Optional

class InventoryItem(BaseModel):
    upc: str
    name: str
    quantity: int
    expiry: Optional[str]
    nutrition: dict
    purchase_price: float
    store: str

class MealPlanRequest(BaseModel):
    members: int
    days: int

class MealPlan(BaseModel):
    day: int
    meals: List[str]

class BudgetRequest(BaseModel):
    monthly_budget: float
