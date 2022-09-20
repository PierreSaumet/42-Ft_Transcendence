FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm config set legacy-peer-deps true

RUN npm install

# RUN npm install --save npm@latest

COPY . .

# RUN npm install -g serve
# EXPOSE 8080 

CMD ["npm", "run", "serve"]