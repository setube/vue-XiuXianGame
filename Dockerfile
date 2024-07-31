FROM node:20.16.0

RUN mkdir -p /workspace

WORKDIR /workspace

RUN npm config set registry https://registry.npmmirror.com

RUN cd /workspace

RUN git clone https://mirror.ghproxy.com/https://github.com/setube/vue-XiuXianGame.git

RUN mv ./vue-XiuXianGame/* . ; rm -rf ./vue-XiuXianGame/

RUN npm i ; npm i element-ui

RUN npm run build

CMD ["npm", "run", "serve"]