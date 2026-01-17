This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend local configuration

1. Create an `.env.local` file using the sample:

```bash
cp .env.example .env.local
```

2. Ensure the backend is running on `http://localhost:8080` and includes the `/api` prefix.
3. Configure the required frontend environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_DICTIONARY_ID=dev-dictionary
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NEWS=true
NEXT_PUBLIC_NEWS_API_KEY=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
USE_INGESTION=false
```

4. Start the frontend with `npm run dev` and navigate to `http://localhost:3000`.
5. Rutas útiles para validar integración:

```
GET ${NEXT_PUBLIC_API_URL}/cards
POST ${NEXT_PUBLIC_API_URL}/users/auth/login
POST ${NEXT_PUBLIC_API_URL}/users/auth/register
POST ${NEXT_PUBLIC_API_URL}/dictionary/${NEXT_PUBLIC_DICTIONARY_ID}/ask
```

6. Rutas del frontend:
    - `http://localhost:3000/dictionary/${NEXT_PUBLIC_DICTIONARY_ID}/chat`
    - `http://localhost:3000/dictionary/chat` (usa el fallback de `NEXT_PUBLIC_DICTIONARY_ID`)
    - `http://localhost:3000/cards`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
