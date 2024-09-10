# 使用 Nginx 作为基础镜像
FROM nginx:alpine

# 拉取最新的 release 包
RUN apk add --no-cache curl && \
    curl -s https://api.github.com/repos/setube/vue-XiuXianGame/releases/latest \
    | grep "zipball_url" \
    | cut -d '"' -f 4 \
    | xargs curl -L -o latest_release.zip

# 解压 release 包
RUN apk add --no-cache unzip && \
    unzip latest_release.zip -d /usr/share/nginx/html && \
    rm latest_release.zip

# 将本地的 nginx 配置文件复制到容器中
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 8080 端口
EXPOSE 8080

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
