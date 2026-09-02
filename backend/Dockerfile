FROM oven/bun:alpine

WORKDIR /app

ENV PORT=3001

COPY package.json bun.lock ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile
RUN bunx prisma generate

COPY . .

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
