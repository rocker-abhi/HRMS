# HRMS Redis Server Setup

This repository contains the Docker configuration to run a secure Redis instance for the HRMS application.

## Configuration Details

*   **Host:** `localhost` (when running locally) or container IP
*   **Port:** `6379` (Default Redis Port)
*   **Password:** `admin@123`
*   **Persistence:** Enabled (AOF + RDB) so data is not lost when the container stops/restarts.
*   **Database Mapping (`hrms_tokens`):** 
    *   Standard Redis does not support *named* databases (like SQL or MongoDB do). Instead, Redis provides numeric database indices (numbered `0` to `15` by default).
    *   You can use **DB `0`** (or any index of your choice) to store your `hrms_tokens`. 
    *   In your application connection string, you would specify this index. For example: `redis://:admin@123@localhost:6379/0` (where `0` represents your `hrms_tokens` database).

---

## How to Run

You can run the Redis container using either **Docker Compose** (recommended) or direct **Docker CLI commands**.

### Option A: Using Docker Compose (Recommended)

1.  **Start the container:**
    ```bash
    docker compose up -d --build
    ```
    This builds the image, starts the container in the background, maps port `6379`, and mounts a persistent volume.

2.  **Stop the container:**
    ```bash
    docker compose down
    ```

### Option B: Using Direct Docker CLI

If you don't want to use Docker Compose, you can build and run using the Docker CLI:

1.  **Build the image:**
    ```bash
    docker build -t hrms-redis .
    ```

2.  **Run the container with persistent volume storage:**
    ```bash
    docker run -d \
      --name hrms-redis-container \
      -p 6379:6379 \
      -v hrms_redis_volume:/data \
      --restart always \
      hrms-redis
    ```

---

## Verifying the Setup

To verify that the Redis server is running properly and requiring authentication:

1.  **Access the Redis CLI inside the container:**
    ```bash
    docker exec -it hrms-redis redis-cli
    ```

2.  **Attempt to ping without authenticating (Should return an authentication error):**
    ```
    127.0.0.1:6379> ping
    (error) NOAUTH Authentication required.
    ```

3.  **Authenticate with the configured password:**
    ```
    127.0.0.1:6379> auth admin@123
    OK
    ```

4.  **Ping again (Should return PONG):**
    ```
    127.0.0.1:6379> ping
    PONG
    ```

5.  **Select database index (e.g., `0` for `hrms_tokens`):**
    ```
    127.0.0.1:6379> select 0
    OK
    ```

6.  **Exit CLI:**
    ```
    127.0.0.1:6379> exit
    ```
