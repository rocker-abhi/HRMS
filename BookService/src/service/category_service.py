import logging
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from src.repository.database_repository import CategoryRepository

logger = logging.getLogger(__name__)


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CategoryRepository(db)

    async def get_all_categories(self):
        categories = self.repo.get_all_categories()
        return {
            "success": True,
            "message": "Categories retrieved successfully.",
            "data": categories
        }
