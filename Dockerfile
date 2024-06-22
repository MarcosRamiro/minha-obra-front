FROM node:20-alpine as build

WORKDIR /workspace/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:latest

ARG DEPENDENCY=/workspace/app/dist/minha-obra-front/browser

COPY --from=build ${DEPENDENCY}/** /usr/share/nginx/html/

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
