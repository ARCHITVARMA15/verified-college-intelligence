FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json ./
RUN npm install

FROM dependencies AS build
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
