# Ethan Website Backend

Backend API built with Hono and Postgresql

## Deploying

Set up environment variables in `.env`

```
COOKIE_SECRET=[cookie_secret]
DATABASE_URL=[database_url]
```

Build and run the hono app

```
# Create the database
npx drizzle-kit migrate

npm run build
npm start
```

## Development

```
npm install
npm run dev
```
