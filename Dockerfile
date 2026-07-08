FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

RUN cd server && npm install
COPY server/ ./server/
COPY --from=web /app/web/dist ./web/dist
# Harden web assets: set ownership to root and make files read-only.
# Directories need 555 (r-x) for traversal; files need 444 (r--) only.
# This prevents any co-located service (e.g. FTP) from modifying served content.
RUN chown -R root:root ./web/dist \
 && find ./web/dist -type d -exec chmod 555 {} + \
 && find ./web/dist -type f -exec chmod 444 {} +
ENV PORT=3000
EXPOSE 3000
WORKDIR /app/server
# Start development server
CMD ["npm", "run", "dev"]
