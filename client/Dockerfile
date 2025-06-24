# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Accept build arguments for environment configuration
ARG NODE_ENV=production
ARG VITE_MODE=production
ARG VITE_API_BASE_URL

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV VITE_MODE=$VITE_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Use npm ci for reproducible builds (respects package-lock.json exactly)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the React application with Vite
RUN npm run build

# Stage 2: Serve with nginx (better for React SPAs)
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]