FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG REACT_APP_API_BASE_URL=https://absensiappwebapi.azurewebsites.net/api/v1/admin/
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

EXPOSE 3000

CMD ["npm", "start"]
