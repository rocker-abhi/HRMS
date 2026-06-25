from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryListResponse(BaseModel):
    success: bool
    message: str
    data: List[CategoryResponse]
