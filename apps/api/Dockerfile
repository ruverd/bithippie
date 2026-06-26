FROM oven/bun:1
WORKDIR /app

# Install workspace deps (root + apps/api) using the lockfile.
# bun.lock* matches whichever lockfile name your Bun version produced.
COPY package.json bun.lock* ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN bun install --frozen-lockfile

# Copy the source needed for migrations + seed.
COPY tsconfig.base.json tsconfig.base.json
COPY apps/api apps/api

# Generate the Prisma Client against the schema.
RUN cd apps/api && bunx prisma generate

# Apply migrations, then seed. Postgres stays up; this one-shot service exits 0.
CMD ["sh", "-c", "cd apps/api && bunx prisma migrate deploy && bunx prisma db seed"]
