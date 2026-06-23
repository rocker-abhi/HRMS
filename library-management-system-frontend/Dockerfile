# Use official light-weight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Start Vite dev server binding to all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
