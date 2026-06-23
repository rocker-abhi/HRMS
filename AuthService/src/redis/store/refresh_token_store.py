from ..interace.redis_interface import RedisInterface

class RefreshTokenStore(RedisInterface):
    REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60

    def __init__(self, redis_client):
        self.redis_client = redis_client
    
    async def set(self, key:str, value:str) -> None:
        await self.redis_client.set(f'refresh:{key}', value, ex=self.REFRESH_TOKEN_TTL)
    
    async def get(self, key:str) -> str | None:
        val = await self.redis_client.get(f'refresh:{key}')
        if val is not None and isinstance(val, bytes):
            return val.decode("utf-8")
        return val
    
    async def delete(self, key:str) -> None:
        await self.redis_client.delete(f'refresh:{key}')