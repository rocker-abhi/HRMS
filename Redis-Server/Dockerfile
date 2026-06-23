# Use the official lightweight Alpine-based Redis image
FROM redis:7.2-alpine

# Create a directory for custom configuration
WORKDIR /usr/local/etc/redis

# Copy the custom redis.conf into the container
COPY redis.conf redis.conf

# Expose the Redis default port
EXPOSE 6379

# Run redis-server using our custom configuration file
CMD ["redis-server", "redis.conf"]
