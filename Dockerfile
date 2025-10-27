# ------------------------
# 1️⃣ Базовый слой (build stage)
# ------------------------
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и yarn.lock
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile

# Копируем исходный код
COPY . .

# Собираем TypeScript в JS
RUN yarn build


# ------------------------
# 2️⃣ Продакшн слой (runtime)
# ------------------------
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Устанавливаем только продакшн-зависимости
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Копируем собранное приложение из builder
COPY --from=builder /usr/src/app/dist ./dist

# Указываем переменную окружения
ENV NODE_ENV=production

# Открываем порт
EXPOSE 3000

# Запуск приложения
CMD ["node", "dist/main.js"]
