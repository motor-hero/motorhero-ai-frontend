# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the code
COPY . .

# Generate router files
RUN npm run generate-router

# Build the app
RUN npm run build

# Create a tarball of the build output
RUN tar -czvf dist.tar.gz -C dist .

# Final stage
FROM alpine:latest

# Copy the tarball from the build stage
COPY --from=build /app/dist.tar.gz /dist.tar.gz

# Set the entrypoint to simply exist (this container won't actually run)
ENTRYPOINT ["tail", "-f", "/dev/null"]