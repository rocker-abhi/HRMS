from ..interace.redis_interface import RedisInterface

class RefreshTokenStore(RedisInterface):
    REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60

    def __init__(self, redis_client):
        self.redis_client = redis_client
    
    def set(self, key:str, value:str):
        self.redis_client.set(f'refresh:{key}', value, ex=self.REFRESH_TOKEN_TTL)
    
    def get(self, key:str):
        return self.redis_client.get(f'refresh:{key}')
    
    def delete(self, key:str):
        self.redis_client.delete(f'refresh:{key}')