from datetime import date
from uuid import UUID

from sqlalchemy import Date, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

# pyrefly: ignore [missing-import]
from src.models.base import BaseModel
# pyrefly: ignore [missing-import]
from src.enums.Borrow_enums import BorrowEnums


class Borrow_Record_model(BaseModel):
    __tablename__ = "borrow_record"
    __table_args__ = {"schema": "borrow_service"}

    book_id: Mapped[UUID | None] = mapped_column(Uuid, nullable=True)
    book_title: Mapped[str] = mapped_column(String(255), nullable=False)
    borrower_name: Mapped[str] = mapped_column(String(255), nullable=False)
    borrow_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default=BorrowEnums.ACTIVE
    )

    def __repr__(self) -> str:
        return f"<BorrowRecord {self.borrower_name} - {self.book_title}>"