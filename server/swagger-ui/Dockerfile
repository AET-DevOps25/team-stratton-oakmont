# Use NGINX as a lightweight web server for Swagger UI
FROM nginx:alpine

# Copy all Swagger UI static assets
COPY index.html /usr/share/nginx/html/index.html
# If you have OpenAPI specs or other static files, copy them as well
# COPY openapi.yaml /usr/share/nginx/html/openapi.yaml
# COPY swagger.json /usr/share/nginx/html/swagger.json
# COPY assets/ /usr/share/nginx/html/assets/

# Optionally, override default NGINX config for SPA routing or CORS
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# NGINX runs by default
