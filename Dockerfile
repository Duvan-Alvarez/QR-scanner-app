FROM node:20-bullseye

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source
COPY . .

# Ensure environment directory for sqlite exists when using volume path
RUN mkdir -p /app/data

# Build the Next.js app
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
