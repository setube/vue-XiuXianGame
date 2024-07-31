# 我的文字修仙全靠刷
本项目基于Vue.js开发

# 游戏交流群 920930589
https://qm.qq.com/q/iifNs5qukg

# 项目预览
![预览图](https://github.com/user-attachments/assets/0f9c17bf-469d-4b6a-b3ed-620078f31ff6)

# 安装依赖
npm install

# 编译项目
npm run build

# 运行项目
npm run serve

# 技术栈
Vue, Vuex, Element-ui

# 在线体验
https://setube.github.io/vue-XiuXianGame

---
# Docker

Docker Build:
```
docker build -t setube/vue-xiuxiangame -f Dockerfile .
```

Docker Run:
```
docker run -p 8080:8080 setube/vue-xiuxiangame
```

Docker Image Pull (From TencentCloud)
```
docker pull ccr.ccs.tencentyun.com/wuchen/vue-xiuxiangame:0.6.9
```

RUN:

```
docker run -p 8080:8080 ccr.ccs.tencentyun.com/wuchen/vue-xiuxiangame:0.6.9
```

Docker Compose (Example)
```docker-compose.yaml
version: '3.9'
services:
    vue-xiuxiangame:
        image: vue-xiuxiangame:0.6.9
        # You can also change it to ccr.ccs.tencentyun.com/wuchen/vue-xiuxiangame:0.6.9
        ports:
            - '8080:8080'
        container_name: xiuxian0
        tty: true
        stdin_open: true
```

**Tip: When using NGINX as a reverse proxy, please note that the request address is `localhost` or `127.0.0.1`**

---

# 碎碎念
大佬们如果觉得好玩的话可以给我这个项目点个免费的star吗?拜托拜托这对我真的很重要!~
