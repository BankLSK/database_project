from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SaleItemCreate(BaseModel):
    book_id:int
    quantity:int
    unit_price:float
    subtotal:float

class SaleCreate(BaseModel):
    customer_id: Optional[int]
    staff_id:int
    payment_method:str
    payment_status:str
    items: List[SaleItemCreate]