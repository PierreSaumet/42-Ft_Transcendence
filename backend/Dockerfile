FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm config set legacy-peer-deps true

RUN npm install

# RUN npm install --save npm@latest

COPY . .

# EXPOSE 3000 

CMD ["npm", "run", "start:dev"]