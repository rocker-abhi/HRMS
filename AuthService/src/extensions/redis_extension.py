from redis.asyncio.cluster import logger
from redis.asyncio import Redis, client

class RedisManager:

    __redis_client = None

    @classmethod
    async def init_app(cls,host:str,port:int,db:int,password:str):
        cls.__redis_client = Redis(
            host = host,
            port=port,
            db=db,
            password = password
        )
        await cls.__redis_client.ping()
    
    @classmethod
    def get_client(cls):
        return cls.__redis_client
