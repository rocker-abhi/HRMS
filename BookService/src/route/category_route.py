import logging
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

# pyrefly: ignore [missing-import]
from src.extensions.database_extension import get_db
# pyrefly: ignore [missing-import]
from src.service.category_service import CategoryService
# pyrefly: ignore [missing-import]
from src.middlewares.jwt_authentication_middleware import jwt_required
# pyrefly: ignore [missing-import]
from src.validators.category_validator import CategoryListResponse

logger = logging.getLogger(__name__)

category_router = APIRouter(
    prefix="/categories",
    tags=['Category Management']
)


@category_router.get("", response_model=CategoryListResponse)
@jwt_required
async def get_all_categories(request: Request, db: Session = Depends(get_db)):
    """List all categories."""
    service = CategoryService(db)
    result = await service.get_all_categories()
    return result