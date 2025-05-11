from sqlalchemy.orm import Session

from . import schemas
from . import models

def create_sale(db: Session,sale: schemas.SaleCreate):
    total=sum(item.subtotal for item in sale.items)
    db_sale=models.Sale(
        customer_id=sale.customer_id,
        staff_id=sale.staff_id,
        total_amount=total,
        payment_method=sale.payment_method,
        payment_status=sale.payment_status

    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    for item in sale.items:
        db_items=models.SaleItem(
            sale_id=db_sale.sale_id,
            book_id=item.book_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal
        )
        db.add(db_items)

        book = db.query(models.Book).filter(models.Book.book_id==item.book_id).first()
        if book:
            book.stock_quantity-=item.quantity

    db.commit()
    return db_sale