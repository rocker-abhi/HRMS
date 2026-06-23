# Use official light-weight Nginx alpine image
FROM nginx:alpine

# Remove default configuration file
RUN rm /etc/nginx/nginx.conf

# Copy custom configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
