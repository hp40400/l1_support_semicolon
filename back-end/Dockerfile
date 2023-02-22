FROM node:16.13.1

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY ./src ./src
EXPOSE 3100
CMD npm start
