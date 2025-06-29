import openai
from config import OPENAI_API_KEY
openai.api_key = OPENAI_API_KEY

async def generate_meal_plan(items, members, days):
    prompt = f"Given pantry items {items}, create a {days}-day meal plan for {members} people..."
    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content": prompt}],
        temperature=0.7
    )
    return resp.choices[0].message.content

async def estimate_expiry(upc, image_url=None):
    # stub: use ML model or heuristics
    return "2025-07-15"

async def waste_reduction_tips(item_name):
    prompt = f"Give tips to reduce waste for {item_name}."
    resp = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content": prompt}]
    )
    return resp.choices[0].message.content
