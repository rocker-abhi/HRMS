# pyrefly: ignore [missing-import]
import logging
# pyrefly: ignore [missing-import]
from src.models.user import UserModel
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
import logging

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