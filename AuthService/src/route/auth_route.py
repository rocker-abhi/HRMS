from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.validators.login_validator import (LoginRequest, LoginResponse, LoginData)
# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.service.auth_service import AuthService

auth_route = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@auth_route.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    result = await auth_service.login(payload.username, payload.password)
    return result