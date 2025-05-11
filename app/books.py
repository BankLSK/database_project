from fastapi import APIRouter
from .mock_data import mock_books

router=APIRouter()

@router.get("/books")

def get_books():
    return mock_books