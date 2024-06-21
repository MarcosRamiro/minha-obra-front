FROM node:20-alpine as build

WORKDIR /workspace/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM httpd:latest

ARG DEPENDENCY=/workspace/app/dist/minha-obra-front/browser

WORKDIR /app

COPY --from=build ${DEPENDENCY}/** /usr/local/apache2/htdocs/

EXPOSE 80

CMD ["httpd-foreground"]
