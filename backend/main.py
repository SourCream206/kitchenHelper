import os
from typing import List, Dict, Optional
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

# Local product cache for common items
PRODUCT_CACHE = {
    "6001253010178": {
        "found": True,
        "name": "Bread",
        "category": "bread",
        "brand": "",
        "nutrition": {"calories": 80, "carbs": 15, "protein": 3},
        "image_url": "",
        "upc": "6001253010178"
    },
    # Add more common products here
}

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
budget_state: Dict[str, float] = {"monthly_budget": 0.0, "spent_this_month": 0.0}
user_location: Dict[str, str] = {"zip_code": "M5V 3A8", "city": "Toronto, ON"}
purchase_history: List["PurchaseRecord"] = []


class InventoryItem(BaseModel):
    id: Optional[str] = None  # Add ID field for React keys
    upc: str
    name: Optional[str] = None
    purchase_price: Optional[float] = None
    store: Optional[str] = None
    quantity: int = Field(1, ge=1)
    unit: str = "pieces"  # Add unit field
    remaining_quantity: Optional[int] = None  # Add remaining quantity field
    total_quantity: Optional[int] = None  # Add total quantity field
    expiry: Optional[datetime] = None
    expiry_date: Optional[str] = None  # Add expiry_date field for frontend
    nutrition: Dict[str, float] = {}
    category: Optional[str] = None
    purchase_date: Optional[datetime] = None


class PurchaseRecord(BaseModel):
    upc: str
    item_name: str
    price: float
    store: str
    date: datetime
    quantity: int = 1


class Budget(BaseModel):
    monthly_budget: float = Field(..., gt=0)


class LocationUpdate(BaseModel):
    zip_code: str
    city: str


class MealPlanRequest(BaseModel):
    days: int = Field(..., gt=0, le=14)
    members: int = Field(..., gt=0)


class EnhancedInventoryItem(BaseModel):
    upc: Optional[str] = None  # Make UPC optional
    name: Optional[str] = None
    purchase_price: float = Field(..., gt=0)
    store: str
    quantity: int = Field(1, ge=1)
    category: Optional[str] = None
    unit: str = "pieces"  # Add unit field with default value


# Add this before the location endpoints
async def fetch_product_info(upc: str) -> dict:
    """Fetch product information from Open Food Facts API with local cache"""
    print(f"🔍 Fetching product info for UPC: {upc}")
    
    # Check local cache first (only for specific known products)
    if upc in PRODUCT_CACHE:
        print(f"✅ Found {upc} in local cache: {PRODUCT_CACHE[upc]['name']}")
        return PRODUCT_CACHE[upc]
    
    print(f"🌐 UPC {upc} not in cache, fetching from Open Food Facts API...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OFF_API_BASE}/{upc}.json", timeout=3.0)  # Reduced timeout to 3 seconds
            print(f"📡 API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📦 API Response Data: {data}")
                
                if data.get("status") == 1:  # Product found
                    product = data.get("product", {})
                    result = {
                        "found": True,
                        "name": product.get("product_name", f"Product (UPC: {upc})"),
                        "category": product.get("categories_tags", ["food"])[0] if product.get("categories_tags") else "food",
                        "brand": product.get("brands", ""),
                        "nutrition": product.get("nutriments", {}),
                        "image_url": product.get("image_url", ""),
                        "upc": upc
                    }
                    print(f"✅ Found product in API: {result['name']}")
                    print(f"📋 Product details: {result}")
                    
                    # Only cache products that are actually found in the API AND have a real name
                    if result['name'] and result['name'] != f"Product (UPC: {upc})":
                        PRODUCT_CACHE[upc] = result
                        print(f"💾 Cached product: {result['name']}")
                    
                    return result
                else:
                    print(f"❌ Product not found in Open Food Facts API for UPC: {upc}")
                    print(f"📋 API Response: {data}")
            else:
                print(f"❌ API returned status {response.status_code} for UPC: {upc}")
    except Exception as e:
        print(f"❌ Error fetching product info for UPC {upc}: {e}")
    
    # Fallback for when API fails or product not found
    print(f"⚠️ Using fallback for UPC: {upc}")
    return {
        "found": False,
        "name": f"Product (UPC: {upc})",
        "category": "food",
        "brand": "",
        "nutrition": {},
        "image_url": "",
        "upc": upc,
        "error": "Product not found in database"
    }

@app.get("/product/{upc}")
async def get_product_info(upc: str):
    """Get product information by UPC"""
    return await fetch_product_info(upc)

# Location endpoints
@app.post("/location")
async def set_location(location: LocationUpdate):
    user_location["zip_code"] = location.zip_code
    user_location["city"] = location.city
    return {"message": "Location updated", "location": user_location}


@app.get("/location")
async def get_location():
    return user_location


@app.get("/nearby-stores")
async def get_nearby_stores():
    """Get nearby grocery stores and food options"""
    # Get user location for context
    location = user_location.get("city", "Toronto")
    
    # Mock data for Toronto area stores
    toronto_stores = [
        {
            "id": 1,
            "name": "Loblaws",
            "address": "123 Queen St W, Toronto, ON",
            "distance": "0.8 km",
            "rating": 4.2,
            "price_level": "$$",
            "types": ["grocery_store", "supermarket"],
            "position": {
                "lat": 43.6532 + 0.01,
                "lng": -79.3832 + 0.01
            },
            "hours": "7:00 AM - 11:00 PM",
            "phone": "(416) 555-1234"
        },
        {
            "id": 2,
            "name": "Sobeys",
            "address": "456 Yonge St, Toronto, ON",
            "distance": "1.2 km",
            "rating": 4.5,
            "price_level": "$$",
            "types": ["grocery_store"],
            "position": {
                "lat": 43.6532 - 0.008,
                "lng": -79.3832 + 0.015
            },
            "hours": "7:00 AM - 10:00 PM",
            "phone": "(416) 555-2345"
        },
        {
            "id": 3,
            "name": "No Frills",
            "address": "789 Dundas St W, Toronto, ON",
            "distance": "1.5 km",
            "rating": 4.0,
            "price_level": "$",
            "types": ["grocery_store", "discount_store"],
            "position": {
                "lat": 43.6532 + 0.012,
                "lng": -79.3832 - 0.005
            },
            "hours": "8:00 AM - 9:00 PM",
            "phone": "(416) 555-3456"
        },
        {
            "id": 4,
            "name": "Walmart Supercenter",
            "address": "321 Dufferin St, Toronto, ON",
            "distance": "2.1 km",
            "rating": 4.3,
            "price_level": "$$",
            "types": ["department_store", "grocery_store"],
            "position": {
                "lat": 43.6532 - 0.015,
                "lng": -79.3832 - 0.01
            },
            "hours": "8:00 AM - 10:00 PM",
            "phone": "(416) 555-4567"
        },
        {
            "id": 5,
            "name": "Whole Foods Market",
            "address": "654 Avenue Rd, Toronto, ON",
            "distance": "2.8 km",
            "rating": 4.7,
            "price_level": "$$$",
            "types": ["grocery_store", "organic_store"],
            "position": {
                "lat": 43.6532 + 0.018,
                "lng": -79.3832 + 0.02
            },
            "hours": "7:00 AM - 10:00 PM",
            "phone": "(416) 555-5678"
        },
        {
            "id": 6,
            "name": "FreshCo",
            "address": "987 Bloor St W, Toronto, ON",
            "distance": "3.2 km",
            "rating": 4.1,
            "price_level": "$",
            "types": ["grocery_store", "supermarket"],
            "position": {
                "lat": 43.6532 + 0.025,
                "lng": -79.3832 - 0.015
            },
            "hours": "7:00 AM - 11:00 PM",
            "phone": "(416) 555-6789"
        }
    ]
    
    return {"stores": toronto_stores}


# Enhanced budget endpoints
@app.post("/budget")
async def set_budget(b: Budget):
    budget_state["monthly_budget"] = b.monthly_budget
    return budget_state


@app.get("/budget")
async def get_budget():
    # Calculate spent this month from purchase history
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    spent_this_month = sum(
        record.price * record.quantity
        for record in purchase_history
        if record.date.month == current_month and record.date.year == current_year
    )
    
    budget_state["spent_this_month"] = spent_this_month
    
    # Calculate inventory value
    inventory_value = sum(
        (item.purchase_price or 0) * item.quantity
        for item in inventory
    )
    
    return {
        **budget_state,
        "inventory_value": inventory_value,
        "remaining_budget": budget_state["monthly_budget"] - spent_this_month,
        "cost_per_day": spent_this_month / datetime.now().day if datetime.now().day > 0 else 0
    }


@app.get("/spending-analysis")
async def get_spending_analysis():
    """Get AI-powered spending analysis"""
    if not purchase_history:
        return {"analysis": "No purchase history available yet."}
    
    # Prepare spending data for AI
    spending_summary = {}
    for record in purchase_history:
        store = record.store
        if store not in spending_summary:
            spending_summary[store] = {"total": 0, "items": 0}
        spending_summary[store]["total"] += record.price * record.quantity
        spending_summary[store]["items"] += record.quantity
    
    prompt = f"""
    Analyze this grocery spending data and provide insights:
    
    Monthly Budget: ${budget_state['monthly_budget']}
    Current Month Spending: ${budget_state['spent_this_month']}
    
    Store Breakdown: {spending_summary}
    
    Recent Purchases: {[f"{r.item_name} at {r.store} for ${r.price}" for r in purchase_history[-10:]]}
    
    Provide specific recommendations for:
    1. Budget optimization
    2. Store selection
    3. Spending patterns
    4. Cost-saving opportunities
    """
    
    analysis = call_openai(prompt, "You are a financial advisor specializing in grocery budgeting.")
    return {"analysis": analysis}


# AI-powered expiry estimation
async def estimate_expiry_date(product_name: str, category: Optional[str] = None) -> datetime:
    """Use AI to estimate expiry date based on product type"""
    prompt = f"""
    Estimate the shelf life in days for: {product_name}
    Category: {category or 'unknown'}
    
    Consider typical storage conditions (pantry/fridge/freezer).
    Return only a number representing days until expiry.
    """
    
    try:
        days_str = call_openai(prompt, "You are a food safety expert. Return only the number of days.")
        days = int(''.join(filter(str.isdigit, days_str)))
        return datetime.utcnow() + timedelta(days=min(days, 365))  # Cap at 1 year
    except:
        # Fallback to default estimates
        default_days = {
            "fresh": 7,
            "dairy": 14,
            "meat": 5,
            "pantry": 180,
            "frozen": 90
        }
        days = default_days.get(category or "unknown", 30)
        return datetime.utcnow() + timedelta(days=days)


# Enhanced inventory endpoints
@app.post("/inventory", response_model=InventoryItem)
async def add_inventory(item: EnhancedInventoryItem):
    # Generate a UPC if not provided
    upc = item.upc or f"generated_{int(datetime.utcnow().timestamp())}"
    
    # Generate a unique ID
    item_id = f"item_{int(datetime.utcnow().timestamp())}"
    
    # Get product info from Open Food Facts if UPC is provided
    data = {}
    if item.upc:
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{OFF_API_BASE}/{item.upc}.json", timeout=10)
                data = resp.json().get("product", {})
            except:
                data = {}
    
    # Get product name and category
    product_name = item.name or data.get("product_name", "Unknown product")
    product_category = item.category or data.get("categories", "").split(",")[0] if data.get("categories") else None
    
    # AI-powered expiry estimation
    expiry_date = await estimate_expiry_date(product_name, product_category or "food")
    
    # Create inventory item
    inventory_item = InventoryItem(
        id=item_id,
        upc=upc,
        name=product_name,
        purchase_price=item.purchase_price,
        store=item.store,
        quantity=item.quantity,
        unit=item.unit or "pieces",
        remaining_quantity=item.quantity,
        total_quantity=item.quantity,
        expiry=expiry_date,
        expiry_date=expiry_date.isoformat() if expiry_date else None,
        nutrition=data.get("nutriments", {}),
        category=product_category,
        purchase_date=datetime.utcnow()
    )
    
    # Add to purchase history
    purchase_record = PurchaseRecord(
        upc=upc,
        item_name=product_name,
        price=item.purchase_price,
        store=item.store,
        date=datetime.utcnow(),
        quantity=item.quantity
    )
    purchase_history.append(purchase_record)
    
    inventory.append(inventory_item)
    return inventory_item


@app.get("/inventory", response_model=List[InventoryItem])
async def list_inventory():
    return inventory


@app.delete("/inventory/{upc}")
async def remove_inventory(upc: str, quantity: int = Query(1, ge=1)):
    """Remove up to `quantity` items matching `upc` from inventory"""
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
    """Clear entire inventory"""
    inventory.clear()
    return {"cleared": True}


# OpenAI helper
def call_openai(prompt: str, system: str) -> str:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        content = resp.choices[0].message.content
        return content.strip() if content else "No response from AI"
    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)}"


@app.post("/mealplan")
async def meal_plan(req: MealPlanRequest):
    """Enhanced AI meal planning with budget and nutrition optimization"""
    if not inventory:
        return {"meal_plan": "No items in inventory. Please add some groceries first!"}
    
    # Prepare detailed inventory data
    items = []
    total_value = 0
    for item in inventory:
        expiry_days = (item.expiry - datetime.utcnow()).days if item.expiry else 30
        items.append({
            "name": item.name,
            "quantity": item.quantity,
            "expiry_days": expiry_days,
            "price": item.purchase_price or 0,
            "nutrition": item.nutrition,
            "category": item.category
        })
        total_value += (item.purchase_price or 0) * item.quantity
    
    cost_per_person_per_day = total_value / (req.members * req.days) if req.members and req.days else 0
    
    prompt = f"""
    Create a {req.days}-day meal plan for {req.members} people using ONLY these available items:
    
    Available Inventory: {items}
    
    Budget Context:
    - Total inventory value: ${total_value:.2f}
    - Target cost per person per day: ${cost_per_person_per_day:.2f}
    - Monthly budget: ${budget_state.get('monthly_budget', 0)}
    
    Requirements:
    1. Use items closest to expiry first
    2. Create balanced, nutritious meals
    3. Maximize food usage to minimize waste
    4. Consider portion sizes for {req.members} people
    5. Include breakfast, lunch, and dinner
    6. Provide cost estimates for each meal
    7. Suggest any critical missing ingredients
    
    Format as a day-by-day plan with meals and estimated costs.
    """
    
    system_prompt = """You are a professional meal planner and nutritionist specializing in budget-conscious, waste-reducing meal planning. Focus on practical, achievable meals that maximize nutrition and minimize cost."""
    
    plan = call_openai(prompt, system_prompt)
    return {"meal_plan": plan}


@app.get("/whatcanieat")
async def what_can_i_eat():
    """Enhanced 'What Can I Eat' with cost and nutrition focus"""
    if not inventory:
        return {"options": "No items in inventory. Please add some groceries first!"}
    
    # Prepare inventory with urgency (expiry dates)
    urgent_items = []
    regular_items = []
    
    for item in inventory:
        expiry_days = (item.expiry - datetime.utcnow()).days if item.expiry else 30
        item_info = {
            "name": item.name,
            "quantity": item.quantity,
            "expiry_days": expiry_days,
            "price": item.purchase_price or 0
        }
        
        if expiry_days <= 3:
            urgent_items.append(item_info)
        else:
            regular_items.append(item_info)
    
    prompt = f"""
    Based on available ingredients, suggest complete meal options:
    
    URGENT (use first - expiring soon): {urgent_items}
    REGULAR items: {regular_items}
    
    For each meal suggestion:
    1. List required ingredients from inventory
    2. Estimate preparation time
    3. Calculate approximate cost per serving
    4. Rate nutrition value (1-10)
    5. Prioritize meals using urgent items
    6. Include simple cooking instructions
    
    Focus on practical, achievable recipes that maximize ingredient usage.
    """
    
    options = call_openai(prompt, "You are a creative chef specializing in using available ingredients efficiently.")
    return {"options": options}


@app.get("/tips")
async def waste_tips():
    """Enhanced waste reduction tips with specific item context"""
    if not inventory:
        return {"tips": "Add some items to your inventory to get personalized waste reduction tips!"}
    
    # Categorize items by expiry urgency
    expiring_soon = []
    perishables = []
    
    for item in inventory:
        expiry_days = (item.expiry - datetime.utcnow()).days if item.expiry else 30
        if expiry_days <= 5:
            expiring_soon.append(item.name)
        elif expiry_days <= 14:
            perishables.append(item.name)
    
    prompt = f"""
    Provide specific waste reduction tips for these items:
    
    EXPIRING SOON (within 5 days): {expiring_soon}
    PERISHABLES (within 2 weeks): {perishables}
    ALL ITEMS: {[item.name for item in inventory]}
    
    Include tips for:
    1. Immediate use strategies for expiring items
    2. Preservation methods (freezing, drying, pickling)
    3. Creative uses for food scraps
    4. Storage optimization
    5. Regrowning vegetables from scraps
    6. Batch cooking and meal prep suggestions
    
    Make tips specific and actionable.
    """
    
    tips = call_openai(prompt, "You are an expert in food preservation and zero-waste cooking.")
    return {"tips": tips}


@app.get("/price-comparison")
async def price_comparison():
    """Get AI-powered price comparison suggestions"""
    if not user_location.get("zip_code"):
        return {"suggestions": "Please set your location first for local price comparisons."}
    
    recent_purchases = purchase_history[-20:] if purchase_history else []
    
    prompt = f"""
    Analyze recent grocery purchases and suggest cost-saving opportunities:
    
    Location: {user_location['city']}, {user_location['zip_code']}
    Recent Purchases: {[f"{r.item_name} at {r.store} for ${r.price}" for r in recent_purchases]}
    
    Provide suggestions for:
    1. Alternative stores that might be cheaper
    2. Generic brand substitutions
    3. Bulk buying opportunities
    4. Seasonal alternatives
    5. Local farmers markets or co-ops
    6. Store loyalty programs to consider
    
    Focus on practical, location-specific advice.
    """
    
    suggestions = call_openai(prompt, "You are a grocery shopping expert who helps people save money on food.")
    return {"suggestions": suggestions}


@app.get("/cost-per-meal")
async def calculate_cost_per_meal():
    """Calculate cost per meal based on current inventory"""
    if not inventory:
        return {"cost_per_meal": 0, "analysis": "No inventory data available"}
    
    total_value = sum((item.purchase_price or 0) * item.quantity for item in inventory)
    
    # Estimate number of meals from inventory
    prompt = f"""
    Estimate how many meals can be made from this inventory:
    
    Items: {[(item.name, item.quantity, item.category) for item in inventory]}
    Total value: ${total_value:.2f}
    
    Consider:
    - Typical serving sizes
    - Meal combinations possible
    - Breakfast, lunch, dinner portions
    
    Return just the estimated number of total meals possible.
    """
    
    try:
        meals_str = call_openai(prompt, "You are a meal planning expert. Return only the number of estimated meals.")
        estimated_meals = int(''.join(filter(str.isdigit, meals_str))) or 1
    except:
        estimated_meals = len(inventory) * 2  # Fallback estimate
    
    cost_per_meal = total_value / estimated_meals if estimated_meals > 0 else 0
    
    return {
        "cost_per_meal": round(cost_per_meal, 2),
        "estimated_meals": estimated_meals,
        "total_inventory_value": round(total_value, 2),
        "analysis": f"Based on your current inventory worth ${total_value:.2f}, you can make approximately {estimated_meals} meals at ${cost_per_meal:.2f} per meal."
    }