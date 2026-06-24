from ..interace.redis_interface import RedisInterface

class OTPStore(RedisInterface):
    OTP_TTL = 15 * 60 #15 minutes

    def __init__(self, redis_client):
        self.redis_client = redis_client
    
    async def set(self, key:str, value:str) -> None:
        await self.redis_client.set(f'otp:{key}', value, ex=self.OTP_TTL)
    
    async def get(self, key:str) -> str | None:
        val = await self.redis_client.get(f'otp:{key}')
        if val is not None and isinstance(val, bytes):
            return val.decode("utf-8")
        return val
    
    async def delete(self, key:str) -> None:
        await self.redis_client.delete(f'otp:{key}')