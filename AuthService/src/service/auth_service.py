from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from src.repository.database_repository import UserRepository
# pyrefly: ignore [missing-import]
from src.utils.password_hasher import verify_password
# pyrefly: ignore [missing-import]
from src.extensions.jwt_extension import get_jwt_keys
# pyrefly: ignore [missing-import]
from src.utils.access_token_helper import AccessTokenHelper
# pyrefly: ignore [missing-import]
from src.utils.refresh_token_helper import RefreshTokenHelper
# pyrefly: ignore [missing-import]
from src.extensions.redis_extension import RedisManager
# pyrefly: ignore [missing-import]
from src.redis.factory.redis_factory import RedisFactory
# pyrefly: ignore [missing-import]
from src.redis.enum.redis_store_enums import RedisStoreEnums
# pyrefly: ignore [missing-import]
from src.extensions.exception_handler_extensions import ApplicationException
# pyrefly: ignore [missing-import]
from src.exceptions.all_exceptions import ERRORS


class AuthService:
    
    def __init__(self, db: Session):
        self.db = db
        
    async def login(self, username, password):
        user_repo = UserRepository(self.db)
        user = user_repo.get_user_by_username(username)
        
        if not user:
            raise ApplicationException(ERRORS["AUTH_ERROR_001"])
            
        try:
            verify_password(user.password_hash, password)
        except Exception:
            raise ApplicationException(ERRORS["AUTH_ERROR_001"])
            
        if not user.is_active:
            raise ApplicationException(ERRORS["AUTH_ERROR_002"])
            
        # Get JWT configurations
        keys = get_jwt_keys()
        
        access_helper = AccessTokenHelper(
            keys["secret"], 
            keys["algorithm"], 
            keys["access_token_expiration_time"]
        )
        refresh_helper = RefreshTokenHelper(
            keys["secret"], 
            keys["algorithm"], 
            keys["refresh_token_expiration_time"]
        )
        
        # Determine role and permissions
        role_name = user.role.name if user.role else ""
        permissions = [p.name for p in user.role.permissions] if user.role else []
        
        access_token = access_helper.create_access_token(
            user_id=user.id, 
            role=role_name, 
            permissions=permissions
        )
        refresh_token = refresh_helper.create_refresh_token(user_id=user.id)
        
        # Save refresh token in Redis
        redis_client = RedisManager.get_client()
        if redis_client is not None:
            refresh_store = RedisFactory.get_store(
                redis_client, 
                RedisStoreEnums.REFRESH_TOKEN
            )
            await refresh_store.set(str(user.id), refresh_token)
            
        return {
            "success": True,
            "message": "Login successful.",
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_id": str(user.id),
                "role": role_name,
                "permissions": permissions,
                "token_type": "Bearer"
            }
        }