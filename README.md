This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Forms

Forms are config-driven. Adding a form means writing its fields, nothing else.

- `lib/forms/<form>.ts` holds the form's field list. It is the only per-form file.
- `lib/forms/registry.ts` (server only) maps a form id to its fields. The server validates against these, never against what the client sends.
- `lib/forms/validate.ts` builds the Yup schema from the fields. The client (`Form` organism) and the server use the same rules.
- `app/actions/submit-form.ts` is the one server action for every form. Bind the id on the client: `submitFormAction.bind(null, "quote")`.
- `lib/forms/submit.ts` validates again, logs, and POSTs `{ formId, values }` to the single `FORMS_ENDPOINT`.

Logs are JSON lines: `form.unknown_id`, `form.validation_failed` (which rule each field failed), `form.submit_failed` (upstream status or error) and `form.submitted`. Each line carries the `requestId` shown to the user in the error message. Hidden field values (e.g. `productId`) are logged; values the user typed are not.

**Why not the Edge runtime?** `export const runtime = "edge"` is deprecated in Next 16. The server action runs on the default runtime, and everything that must stay private (`registry`, `submit`, `logger`) is marked `server-only`, so a client import fails the build.

To try the error state, point `FORMS_ENDPOINT` at `https://dummyjson.com/http/500`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
