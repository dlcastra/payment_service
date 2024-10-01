FROM node:alpine

RUN apk add --no-cache wget

RUN wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz \
  && tar -xzf ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin \
  && rm ngrok-v3-stable-linux-amd64.tgz

CMD ngrok config add-authtoken ${NGROK_AUTHTOKEN} && ngrok http 8080
