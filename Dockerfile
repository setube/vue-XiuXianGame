FROM node:latest

RUN mkdir -p /workspace

WORKDIR /workspace

RUN npm config set registry https://registry.npmmirror.com

RUN cd /workspace

RUN git clone https://mirror.ghproxy.com/https://github.com/setube/vue-XiuXianGame.git

RUN mv ./vue-XiuXianGame/* . ; rm -rf ./vue-XiuXianGame/

RUN npm install -g pnpm ; pnpm install

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "8080"]