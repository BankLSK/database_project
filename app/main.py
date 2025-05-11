from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .sales import router as sale_router
from .database import engine
from . import models 
from .books import router as books_router
from .customers import router as customers_router
from .orders import router as orders_router
#from . import sales

models.Base.metadata.create_all(bind=engine)

app=FastAPI()
#app.include_router(sales.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sale_router, prefix="/sales",tags=["sales"])
app.include_router(books_router)
app.include_router(customers_router)
app.include_router(orders_router)
