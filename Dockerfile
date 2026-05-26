# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/*/package*.json ./packages/

# Install root dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the backend application
WORKDIR /app/apps/backend
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'127.0.0.1',port:3000,path:'/health',method:'GET'}, res => res.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', e => process.exit(1)).end()"

# Start the application
CMD ["node", "dist/main.js"]