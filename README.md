# laravel-diff

> Motivated from railsdiff.org

A utility to compare what files changed when upgrading your Laravel framework. Kind a *Laravel Shift* but tiny and manual. Build with SvelteKit and deploy to Cloudflare Pages.

Previously, this project was split into two projects: worker-laraveldiff with Cloudflare Workers for the REST API (backend) and laraveldiff with SvelteKit for the frontend. But, I feel a burden to maintain two projects and I want to achieve an experience by edit backend and frontend in one repository which is laraveldiff with SvelteKit. Luckily, Cloudflare Pages support this case by use Cloudflare Functions.

> Pages Functions allows you to build full-stack applications by executing code on the Cloudflare network with Cloudflare Workers. With Functions, you can introduce application aspects such as authenticating, handling form submissions, or working with middleware. Workers runtime features are configurable on Pages Functions, including compatibility with a subset of Node.js APIs and the ability to set a compatibility date or compatibility flag. *Source: [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)*.

In SvelteKit, instead of create `functions` directory, I just need to follow [the guide provided by Cloudflare Page Functions](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-site/#functions-setup). You can see the implementation in [routes/api](./src/routes/api/) directory and I just need tweak the [wrangler.toml](./wrangler.toml) file.

## Requirements

This project use PNPM, SvelteKit, and Svelte 5 with Runes. You may also need to set `GITHUB_TOKEN` in `.env` file in order to get `tags` and `diff` in local development.

1. Copy file `.env.example` into `.env` file.

```sh
cp .env.example .env
```

2. To get `GITHUB_TOKEN` you need to do this:

    a. Go to github.com and log in.

    b. Click your profile picture → Settings

    c. Scroll down to "Developer settings" (bottom left)

    d. Click "Personal access tokens" → "Tokens (classic)"

    e. Generate new token

    f. Select the necessary scopes (for accessing repository data, you typically need repo access)

    g. Copy the generated token and paste it into `.env` file.

## How to run?

- Clone repository
- Run command below

```sh
pnpm install
pnpm run dev
```

## Test Before Deploy or Push to Cloudflare

```sh
pnpm run build
npx wrangler pages dev .svelte-kit/cloudflare
```