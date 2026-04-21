FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY . .
EXPOSE 5000
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "5000"]

FROM deps AS build
COPY . .
RUN npm run build
