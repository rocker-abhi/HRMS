# pyrefly: ignore [missing-import]
import logging
# pyrefly: ignore [missing-import]
from src.models.user import UserModel
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
import logging

# pyrefly: ignore [missing-import]
from src.enums.user_account_type_enum import UserAccountTypeEnum

logger = logging.getLogger(__name__)

class UserRepository:
    
    def __init__(self, db_session):
        self.db = db_session
    
    def get_user_by_username(self, username):
        try:
            user = self.db.query(UserModel).filter(UserModel.username == username).first()
            return user
        except Exception as e:
            logger.error(f"Error getting user by username: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_user_by_id(self, user_id):
        try:
            user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
            return user
        except Exception as e:
            logger.error(f"Error getting user by id: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])
    
    def get_all_users(self):
        try:
            users = self.db.query(UserModel).all()
            return users
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def create_user(self, user: UserModel):
        try:
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            return user
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def delete_user(self, user: UserModel):
        try:
            self.db.delete(user)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting user: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])

    def get_user_by_email(self, email):
        try:
            user = self.db.query(UserModel).filter(UserModel.email == email).first()
            return user
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            raise ApplicationException(ERRORS["DB_ERROR_001"])