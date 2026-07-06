#!/bin/sh
set -e

C='\033[0;36m'
G='\033[0;32m'
Y='\033[1;33m'
R='\033[0;31m'
B='\033[1m'
N='\033[0m'

echo ""
printf "${C}${B}  同人游戏站 · Fangame${N}\n"
echo "  ─────────────────────────────"
echo ""

# ── 密钥管理 ─────────────────────────
SECRET_FILE="/app/.secret"

if [ -z "$NEXTAUTH_SECRET" ]; then
  if [ -f "$SECRET_FILE" ]; then
    export NEXTAUTH_SECRET=$(cat "$SECRET_FILE")
    printf "  ${G}✓${N} NEXTAUTH_SECRET 已从持久化文件加载\n"
  else
    NEW_SECRET=$(openssl rand -base64 48)
    echo "$NEW_SECRET" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE" 2>/dev/null || true
    export NEXTAUTH_SECRET="$NEW_SECRET"
    printf "  ${G}✓${N} NEXTAUTH_SECRET 已自动生成并保存到 ${SECRET_FILE}\n"
    printf "  ${Y}!${N} 提示: 未显式设置密钥，容器重建后用户需重新登录\n"
    printf "  ${Y}  ${N} 建议在 .env 中设置 NEXTAUTH_SECRET 以保持会话稳定\n"
  fi
fi

# ── 数据库连通性检查 ─────────────────
DB_HOST=""
DB_PORT="5432"

if echo "$DATABASE_URL" | grep -qE '@[^:]+:[0-9]+/'; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:]+):.*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@[^:]+:([0-9]+).*|\1|')
elif echo "$DATABASE_URL" | grep -qE '@[^/?]+/'; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^/?]+)/.*|\1|')
fi

if [ -n "$DB_HOST" ]; then
  MAX_RETRIES=15
  RETRY=0
  while [ $RETRY -lt $MAX_RETRIES ]; do
    if bash -c "echo > /dev/tcp/${DB_HOST}/${DB_PORT}" 2>/dev/null; then
      printf "  ${G}✓${N} 数据库连接成功 (${DB_HOST}:${DB_PORT})\n"
      break
    fi
    RETRY=$((RETRY + 1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
      printf "  ${R}✗${N} 无法连接数据库 ${DB_HOST}:${DB_PORT}\n"
      printf "  ${Y}!${N} 请检查: PostgreSQL 是否已启动 | DATABASE_URL 是否正确\n"
      exit 1
    fi
    printf "  ${Y}⏳${N} 等待数据库就绪... (${RETRY}/${MAX_RETRIES})\n"
    sleep 2
  done
else
  printf "  ${G}✓${N} 跳过数据库连通性检查\n"
fi

PRISMA="./node_modules/prisma/build/index.js"

# ── 数据库迁移 ───────────────────────
if node "$PRISMA" migrate deploy --schema=./prisma/schema.prisma >/dev/null 2>&1; then
  printf "  ${G}✓${N} 数据库迁移完成\n"
else
  printf "  ${R}✗${N} 数据库迁移失败\n"
  printf "  ${Y}!${N} 正在输出详细错误信息...\n"
  echo ""
  node "$PRISMA" migrate deploy --schema=./prisma/schema.prisma 2>&1
  exit 1
fi

# ── 启动信息 ─────────────────────────
echo ""
printf "  ${G}${B}════════════════════════════════════${N}\n"
printf "  ${G}${B}  服务已启动${N}\n"
printf "  ${G}${B}════════════════════════════════════${N}\n"

APP_URL="${NEXTAUTH_URL:-http://localhost:3000}"
printf "  ${B}访问地址:${N} ${APP_URL}\n"
echo ""

export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=512 --max-http-header-size=1048576"

exec node server.js
