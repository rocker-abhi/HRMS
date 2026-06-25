from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.service.user_service import UserService
# pyrefly: ignore [missing-import]
from src.middlewares.jwt_authentication_middleware import jwt_required
# pyrefly: ignore [missing-import]
from src.validators.get_user_validator import GetUserResponse
# pyrefly: ignore [missing-import]
from src.validators.create_user_validator import (
    CreateUserRequest, CreateUserResponse,
    DeleteUserResponse, UpdateUserRequest, UpdateUserResponse
)
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS

import logging
logger = logging.getLogger(__name__)

user_router = APIRouter(
    tags=['User Management']
)


@user_router.get("/users", response_model=GetUserResponse)
@jwt_required
async def get_all_users(request: Request, db: Session = Depends(get_db)):
    """List all users excluding the currently logged-in user. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    current_user_id = request.state.user.get("user_id")
    user_service = UserService(db)
    result = await user_service.get_all_users(current_user_id)
    return result


@user_router.post("/users", response_model=CreateUserResponse)
@jwt_required
async def create_user(payload: CreateUserRequest, request: Request, db: Session = Depends(get_db)):
    """Create a new user. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    user_service = UserService(db)
    result = await user_service.create_user(payload=payload)
    return result


@user_router.post("/users/{user_id}/reset-password")
@jwt_required
async def reset_user_password_by_admin(user_id: str, request: Request, db: Session = Depends(get_db)):
    """Reset a user's password and generate a new OTP. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    user_service = UserService(db)
    result = await user_service.reset_user_password_by_admin(user_id)
    return result


@user_router.delete("/users/{user_id}", response_model=DeleteUserResponse)
@jwt_required
async def delete_user(user_id: str, request: Request, db: Session = Depends(get_db)):
    """Delete a user. Admin only. Cannot delete admin users."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    user_service = UserService(db)
    result = await user_service.delete_user(user_id)
    return result


@user_router.put("/users/{user_id}", response_model=UpdateUserResponse)
@jwt_required
async def update_user(user_id: str, payload: UpdateUserRequest, request: Request, db: Session = Depends(get_db)):
    """Update a user's details. Admin only."""
    caller_role = request.state.user.get("role")
    if caller_role != "ADMIN":
        raise ApplicationException(ERRORS["JWT_TOKEN_009"])

    user_service = UserService(db)
    result = await user_service.update_user(user_id, payload)
    return result


@user_router.get("/users/search", response_model=GetUserResponse)
@jwt_required
async def search_user(
    request: Request,
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db)
):
    """Search users by username or email."""
    user_service = UserService(db)
    result = await user_service.search_users(q)
    return result

    