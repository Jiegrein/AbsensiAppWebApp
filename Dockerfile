FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Backend base URL, format https://<backend-host>/api/v1/admin/
# Required: docker build --build-arg REACT_APP_API_BASE_URL=<url> .
ARG REACT_APP_API_BASE_URL
RUN test -n "$REACT_APP_API_BASE_URL" || (echo "Build argument REACT_APP_API_BASE_URL is required" && exit 1)
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

EXPOSE 3000

CMD ["npm", "start"]
