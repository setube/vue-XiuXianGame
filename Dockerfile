# 使用较新的 Node.js 镜像版本
FROM node:20.16.0

# 创建并切换到工作目录
WORKDIR /workspace

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

# 克隆项目并移除不必要的目录
RUN git clone https://mirror.ghproxy.com/https://github.com/setube/vue-XiuXianGame.git /workspace \
    && mv /workspace/vue-XiuXianGame/* /workspace \
    && rm -rf /workspace/vue-XiuXianGame

# 安装 pnpm 并安装项目依赖
RUN npm install -g pnpm \
    && pnpm install

# 暴露 Vite 服务器的默认端口
EXPOSE 5173

# 启动 Vite 开发服务器
CMD ["npx", "vite", "--host"]
