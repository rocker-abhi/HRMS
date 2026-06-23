
# pyrefly: ignore [missing-import]
from .src.redis.enum.redis_store_enums import RedisStoreEnums

# pyrefly: ignore [missing-import]
from .src.redis.store.refresh_token_store import RefreshTokenStore

class RedisFactory:
    
    @staticmethod
    def get_store(redis_client, store_type):
        if redis_client is None:
            raise ValueError("Redis client is required")

        store = {
            RedisStoreEnums.REFRESH_TOKEN: RefreshTokenStore
        }
        
        redis_store = store.get(store_type)
        if redis_store is None:
            raise ValueError(f"Redis store not found for store_type: {store_type}")

        if redis_client is None:
            raise ValueError("Redis client is required")
        
        
        return redis_store(redis_client)
