# مشارکت در MindGPT · Contributing

ممنون که وقت می‌گذاری! 💙

## شروع

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

## قوانین

- برای هر تغییر یک branch جدا بساز (`feature/...` یا `fix/...`).
- پیام commit به سبک [Conventional Commits](https://www.conventionalcommits.org): `feat:`، `fix:`، `docs:`، `style:`، `refactor:`.
- قبل از PR: `pnpm typecheck` و `pnpm build` باید بدون خطا باشند.
- رابط را در هر دو جهت **RTL و LTR** و روی عرض موبایل تست کن.
- با تغییر schema یک migration **جدید** بساز (`pnpm db:generate`)؛ migration قبلی را ویرایش نکن.
- هیچ‌وقت کلید API یا فایل `.env` را commit نکن.

## گزارش باگ و ایده

از [Issues](../../issues/new/choose) و قالب‌های آماده استفاده کن.
