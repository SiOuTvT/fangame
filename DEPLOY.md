# 部署步骤

## 服务器环境要求
- Node.js >= 18
- PostgreSQL 已运行
- PM2（进程守护）

---

## 1. 上传代码

把整个 `fangame-next` 文件夹上传到服务器：
```
/www/wwwroot/fangame-next/
```

---

## 2. 配置环境变量

在服务器上编辑 `/www/wwwroot/fangame-next/.env`：

```env
DATABASE_URL="postgresql://fangame:fangame2024@127.0.0.1:5432/fangame"
NEXTAUTH_SECRET="换成一个随机长字符串，比如跑 openssl rand -base64 32"
NEXTAUTH_URL="http://你的域名或IP"
```

生成随机 secret：
```bash
openssl rand -base64 32
```

---

## 3. 安装依赖 + 建表 + 构建

```bash
cd /www/wwwroot/fangame-next

npm install

npx prisma generate
npx prisma db push

npm run build
```

---

## 4. 设置管理员账号

先通过网站注册一个账号，然后执行：

```bash
psql -U fangame -d fangame -c "UPDATE \"User\" SET role = 'ADMIN' WHERE username = '你的用户名';"
```

---

## 5. PM2 启动

```bash
pm2 start npm --name "fangame-next" -- start
pm2 save
pm2 startup
```

默认监听 3000 端口。

---

## 6. Nginx 反向代理（如果用宝塔）

在宝塔面板 → 网站 → 反向代理，填：

```
目标URL：http://127.0.0.1:3000
```

或手动在 Nginx 配置里加：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 后续更新代码

```bash
cd /www/wwwroot/fangame-next
git pull          # 如果用 git
npm run build
pm2 restart fangame-next
```
