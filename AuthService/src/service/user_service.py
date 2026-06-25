import logging
import random
from sqlalchemy.orm import Session
from argon2 import PasswordHasher

# pyrefly: ignore [missing-import]
from src.repository.database_repository import UserRepository
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS
# pyrefly: ignore [missing-import]
from src.extensions.configurations import settings
# pyrefly: ignore [missing-import]
from src.models.user import UserModel
# pyrefly: ignore [missing-import]
from src.extensions.redis_extension import RedisManager
# pyrefly: ignore [missing-import]
from src.redis.factory.redis_factory import RedisFactory
# pyrefly: ignore [missing-import]
from src.redis.enum.redis_store_enums import RedisStoreEnums

logger = logging.getLogger(__name__)
ph = PasswordHasher()

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    async def get_all_users(self, current_user_id=None):
        users = self.repo.get_all_users()
        if current_user_id:
            import uuid
            try:
                cuid = uuid.UUID(current_user_id) if isinstance(current_user_id, str) else current_user_id
                users = [u for u in users if u.id != cuid]
            except ValueError:
                pass
        return {
            "success": True,
            "data": users
        }

    async def create_user(self, payload):
        # Check username uniqueness
        existing_by_username = self.repo.get_user_by_username(payload.username)
        if existing_by_username:
            raise ApplicationException(ERRORS["AUTH_ERROR_005"])

        # Check email uniqueness
        existing_by_email = self.repo.get_user_by_email(payload.email)
        if existing_by_email:
            raise ApplicationException(ERRORS["AUTH_ERROR_006"])

        # Generate an 8-10 digit numeric OTP
        user_otp = str(random.randint(10000000, 9999999999))
        hashed_password = ph.hash(f"{user_otp}{settings.SECRET_KEY}")

        new_user = UserModel(
            username=payload.username,
            email=payload.email,
            password_hash=hashed_password,
            account_type=payload.account_type,
            role_id=None,
            is_active=True,
            is_password_reset=True
        )

        created_user = self.repo.create_user(new_user)
        client = RedisManager.get_client()
        # Store unhashed OTP in Redis with an expiration of 15 minutes (900 seconds)
        redis_store = RedisFactory.get_store(client, RedisStoreEnums.OTP)
        
        await redis_store.set(
            key=str(created_user.id),
            value=user_otp
        )

        return {
            "success": True,
            "message": "User created successfully",
            "data": {
                "user_data": created_user,
                "user_otp": user_otp
            }
        }

    async def reset_user_password_by_admin(self, user_id):
        import uuid
        try:
            uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        except ValueError:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])
            
        user = self.repo.get_user_by_id(uid)
        if not user:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])
            
        # Generate a new 8-10 digit OTP
        user_otp = str(random.randint(10000000, 9999999999))
        hashed_password = ph.hash(f"{user_otp}{settings.SECRET_KEY}")
        
        user.password_hash = hashed_password
        user.is_password_reset = True
        self.db.commit()
        
        # Store raw OTP in Redis (15 mins)
        client = RedisManager.get_client()
        redis_store = RedisFactory.get_store(client, RedisStoreEnums.OTP)
        await redis_store.set(
            key=str(user.id),
            value=user_otp
        )
        
        return {
            "success": True,
            "message": "User password reset successfully by admin.",
            "data": {
                "user_otp": user_otp
            }
        }

    async def delete_user(self, user_id):
        import uuid
        try:
            uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        except ValueError:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])
            
        user = self.repo.get_user_by_id(uid)
        if not user:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])
            
        # Prevent deleting admin users
        if user.account_type and str(user.account_type).upper() == "ADMIN":
            raise ApplicationException(ERRORS["AUTH_ERROR_008"])
        if user.role and user.role.name == "ADMIN":
            raise ApplicationException(ERRORS["AUTH_ERROR_008"])
            
        self.repo.delete_user(user)
        return {
            "success": True,
            "message": "User deleted successfully."
        }

    async def update_user(self, user_id, payload):
        import uuid
        try:
            uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        except ValueError:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])
            
        user = self.repo.get_user_by_id(uid)
        if not user:
            raise ApplicationException(ERRORS["AUTH_ERROR_004"])

        # Prevent modifying admin users' account type or status
        if payload.account_type and user.account_type and str(user.account_type).upper() == "ADMIN":
            raise ApplicationException(ERRORS["AUTH_ERROR_008"])
            
        # Validate unique username
        if payload.username and payload.username.lower() != user.username.lower():
            existing_by_username = self.repo.get_user_by_username(payload.username)
            if existing_by_username:
                raise ApplicationException(ERRORS["AUTH_ERROR_005"])
                
        # Validate unique email
        if payload.email and payload.email.lower() != user.email.lower():
            existing_by_email = self.repo.get_user_by_email(payload.email)
            if existing_by_email:
                raise ApplicationException(ERRORS["AUTH_ERROR_006"])
                
        # Apply updates
        if payload.username is not None:
            user.username = payload.username
        if payload.email is not None:
            user.email = payload.email
        if payload.account_type is not None:
            user.account_type = payload.account_type
        if payload.is_active is not None:
            user.is_active = payload.is_active
            
        self.db.commit()
        self.db.refresh(user)
        
        return {
            "success": True,
            "message": "User updated successfully.",
            "data": user
        }

    async def search_users(self, query: str):
        users = self.repo.search_users(query)
        return {
            "success": True,
            "data": users
        }
