FROM oven/bun:1.2-alpine

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .

RUN bunx prisma generate

ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
