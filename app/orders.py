from fastapi import APIRouter, HTTPException, Body
from app.mock_data import mock_orders, mock_books
import uuid
from datetime import datetime

router = APIRouter(prefix="/orders",tags=["orders"])

@router.get("")
def get_orders():
    return mock_orders

@router.post("")
def create_order(order: dict = Body(...)):
    for item in order.get("items", []):
        book = next((b for b in mock_books if b["id"] == item["book_id"]), None)
        if not book:
            raise HTTPException(status_code=404, detail=f"Book ID {item['book_id']} not found")
        if book["stock"] < item["quantity"]:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {book['title']}")
    for item in order.get("items", []):
        book = next((b for b in mock_books if b["id"] == item["book_id"]), None)
        book["stock"] -= item["quantity"]
    order_id = str(uuid.uuid4())
    order_entry = {
        "id": order_id,
        "timestamp": datetime.utcnow().isoformat(),
        **order
    }
    mock_orders.append(order_entry)
    print("Orders hein",order_entry)
    return {"message": "Order created", "order_id": order_id}