FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

# use explicit server entrypoint, avoids npm start script requirement
CMD ["node", "server.js"]
