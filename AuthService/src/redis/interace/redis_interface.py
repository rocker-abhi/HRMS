from abc import ABC, abstractmethod

class RedisInterface(ABC) : 
    
    @abstractmethod
    def set(self, key, value):
        pass
    
    @abstractmethod
    def get(self, key):
        pass
    
    @abstractmethod
    def delete(self, key):
        pass