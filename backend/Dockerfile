# Use the official Node.js image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files first (Optimization for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the files
COPY . .

# IMPORTANT: Back4App/Docker ko batayein ke port 3000 open hai
EXPOSE 3000

# Start the app
CMD ["npm", "start"]