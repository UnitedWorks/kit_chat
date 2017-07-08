FROM node:6.9.2

RUN mkdir -p /usr/src/kit_chat
WORKDIR /usr/src/kit_chat

COPY . /usr/src/kit_chat
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
