from fastapi import APIRouter
from .mock_data import mock_customers

router=APIRouter(prefix="/customers",tags=["customers"])

@router.get("")
def get_customers():
    return mock_customers