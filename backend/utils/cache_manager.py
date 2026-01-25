import json
import os
import time
import hashlib

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cache')

if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

class CacheManager:
    def __init__(self, expiration_hours=24):
        self.expiration_seconds = expiration_hours * 3600

    def _get_cache_path(self, key):
        # Create a safe filename from the key
        hashed_key = hashlib.md5(key.encode('utf-8')).hexdigest()
        return os.path.join(CACHE_DIR, f"{hashed_key}.json")

    def get(self, key):
        cache_path = self._get_cache_path(key)
        if not os.path.exists(cache_path):
            return None
        
        try:
            with open(cache_path, 'r') as f:
                data = json.load(f)
            
            # Check expiration
            if time.time() - data['timestamp'] > self.expiration_seconds:
                return None
            
            return data['payload']
        except Exception as e:
            print(f"Cache read error: {e}")
            return None

    def set(self, key, payload):
        cache_path = self._get_cache_path(key)
        data = {
            'timestamp': time.time(),
            'payload': payload
        }
        try:
            with open(cache_path, 'w') as f:
                json.dump(data, f)
        except Exception as e:
            print(f"Cache write error: {e}")

# Global instance
cache = CacheManager()