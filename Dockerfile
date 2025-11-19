# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the TypeScript source to JavaScript
RUN npm run build

# The port that your app will run on
EXPOSE 3000

# The command to run the app
CMD [ "node", "dist/main.js" ]
