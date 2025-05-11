from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import crud

from . import schemas
from . import database

router=APIRouter()

def get_db():
    yield None
    #db=database.SessionLocal()
    #try:
        #yield db
    #finally:
        #db.close()


@router.post("")
def checkout_sale(sale: schemas.SaleCreate, db:Session=Depends(get_db)):
    if db is None:
        return {"message":"Simulated (no DB)","sale_id":0}
    try:
        sale_created=crud.create_sale(db,sale)
        return {"message": "Sale was completed succesfly", "sale_id": sale_created.sale_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    