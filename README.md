<div align="center">

<img src="docs/assets/logo.png" alt="MindGPT" width="220" />

# MindGPT · مایند جی‌پی‌تی

**دستیار گفت‌وگوی هوشمند، فارسی و انگلیسی، سبک، سریع و قابل نصب روی گوشی (PWA)**

[![CI](https://github.com/YOUR_USERNAME/MindGPT/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/MindGPT/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/YOUR_USERNAME/MindGPT?color=0a84ff&label=release)](https://github.com/YOUR_USERNAME/MindGPT/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/YOUR_USERNAME/MindGPT/total?color=18c8f0)](https://github.com/YOUR_USERNAME/MindGPT/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-2563eb.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522.13-3c873a.svg)](https://nodejs.org)
[![Telegram](https://img.shields.io/badge/Telegram-dev__vexel-26a5e4?logo=telegram)](https://t.me/dev_vexel)

[**📥 دانلود آخرین نسخه**](https://github.com/YOUR_USERNAME/MindGPT/releases/latest) ·
[گزارش باگ](https://github.com/YOUR_USERNAME/MindGPT/issues/new?template=bug_report.yml) ·
[درخواست قابلیت](https://github.com/YOUR_USERNAME/MindGPT/issues/new?template=feature_request.yml) ·
[English](#-english)

</div>

---

## 📖 فهرست

- [MindGPT چیست؟](#-mindgpt-چیست)
- [امکانات](#-امکانات)
- [دانلود](#-دانلود)
- [نصب و اجرا](#-نصب-و-اجرا)
- [دیپلوی روی Cloudflare](#-دیپلوی-روی-cloudflare)
- [ساختار پروژه](#-ساختار-پروژه)
- [محدودیت‌ها](#%EF%B8%8F-محدودیتها)
- [مشارکت](#-مشارکت)
- [مجوز](#-مجوز)

## 💡 MindGPT چیست؟

MindGPT یک وب‌اپ گفت‌وگوی هوش مصنوعی با رابط تیره و مینیمال، **راست‌به‌چپ کامل** و فونت **وزیر** است که روی موبایل، تبلت و دسکتاپ کار می‌کند و روی اندروید مثل یک اپ نصب می‌شود. مدل‌ها از طریق API سازگار با OpenAI (پیش‌فرض CodeCraft) و **فقط از سمت سرور** صدا زده می‌شوند؛ کلید هیچ‌وقت به مرورگر نمی‌رسد.

> این پروژه محصول رسمی OpenAI یا اشتراک ChatGPT نیست.

## ✨ امکانات

| | قابلیت |
| --- | --- |
| 💬 | پاسخ تدریجی (streaming) با امکان توقف، Markdown، کد قابل کپی و فرمول ریاضی (KaTeX) |
| 🧠 | دریافت زنده‌ی فهرست مدل‌ها و انتخاب مدل از تنظیمات |
| ✏️ | ویرایش پیام، ارسال دوباره، Retry، شاخه‌ی جدید، بازخورد |
| 🗂️ | کشوی گفتگوها، جست‌وجو، پین، تغییر نام، آرشیو، پروژه‌ها و خروجی JSON |
| 📎 | آپلود تصویر، دوربین، PDF، DOCX و فایل متنی (تا ۴ فایل، هر کدام ۱۰MB) |
| 🎙️ | ورودی صوتی با موج صدا و پخش پاسخ با سرعت قابل تنظیم |
| 🌗 | فارسی / انگلیسی، تم تیره / روشن / سیستم |
| 📱 | PWA قابل نصب روی اندروید |
| ⏰ | یادآور با خروجی تقویم ICS |

## 📥 دانلود

آخرین نسخه را از صفحه‌ی **[Releases](https://github.com/YOUR_USERNAME/MindGPT/releases/latest)** بگیر:

| فایل | کاربرد |
| --- | --- |
| `MindGPT-vX.Y.Z-build.zip` | خروجی build آماده‌ی دیپلوی + migration پایگاه داده |
| `MindGPT-vX.Y.Z-source.zip` | سورس کامل پروژه |
| `SHA256SUMS.txt` | هش برای بررسی سلامت فایل |

یا مستقیم clone کن:

```sh
git clone https://github.com/YOUR_USERNAME/MindGPT.git
cd MindGPT
```

## 🚀 نصب و اجرا

**نیازمندی‌ها:** Node.js 22.13+ و pnpm 11.25.0 (از طریق Corepack)

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env        # مقدار CODECRAFT_API_KEY را وارد کن
```

اولین اجرا (ساخت پایگاه داده‌ی محلی):

```sh
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js \
  d1 execute DB --local --config dist/server/wrangler.json \
  --persist-to .wrangler/state --file drizzle/0000_violet_blade.sql
pnpm dev
```

دستورهای مفید:

| دستور | کار |
| --- | --- |
| `pnpm dev` | اجرای محیط توسعه |
| `pnpm build` | ساخت نسخه‌ی production |
| `pnpm start` | اجرای خروجی build به صورت محلی |
| `pnpm typecheck` | بررسی TypeScript |
| `pnpm lint` | بررسی ESLint |

### متغیرهای محیطی

| متغیر | توضیح | پیش‌فرض |
| --- | --- | --- |
| `CODECRAFT_API_KEY` | کلید API (فقط سمت سرور) | ندارد |
| `CODECRAFT_BASE_URL` | آدرس API سازگار با OpenAI | `https://codecraftapi.com/v1` |

## ☁️ دیپلوی روی Cloudflare

پروژه روی **Cloudflare Workers** اجرا می‌شود (D1 برای گفتگوها، R2 برای فایل‌ها). میزبان استاتیک کافی نیست.

1. در Cloudflare یک **D1** به نام `mindgpt-db` و یک **R2** به نام `mindgpt-files` بساز و binding آن‌ها را `DB` و `BUCKET` بگذار.
2. در مخزن GitHub، در **Settings → Secrets and variables → Actions** این‌ها را اضافه کن:
   `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `CODECRAFT_API_KEY` · `D1_DATABASE_ID`
3. از تب **Actions** گزینه‌ی **Deploy to Cloudflare** را اجرا کن (بار اول تیک `run_migration` را بزن).

### 🤖 GitHub Actions

| Workflow | زمان اجرا | کار |
| --- | --- | --- |
| **CI** | هر push و Pull Request | typecheck، lint و build |
| **Release** | push یک تگ مثل `v1.1.0` | ساخت و انتشار فایل‌های دانلود در Releases |
| **Deploy to Cloudflare** | دستی | دیپلوی روی Workers |
| **CodeQL** | هر push و هفتگی | اسکن امنیتی کد |

انتشار نسخه‌ی جدید:

```sh
git tag v1.1.0
git push origin v1.1.0
```

## 🗂️ ساختار پروژه

```
MindGPT/
├── app/
│   ├── page.tsx              # رابط گفتگو، منوها و پنجره‌ها
│   ├── layout.tsx            # متادیتا، آیکن‌ها و PWA
│   ├── globals.css           # ظاهر، RTL و تم‌ها
│   └── api/[...path]/        # API: نشست، گفتگو، فایل، پروکسی مدل
├── lib/                      # اتصال سرور، پیوست‌ها، انواع
├── hooks/use-voice.ts        # ضبط و پخش صدا
├── db/ · drizzle/            # schema و migration
├── components/ui/            # کامپوننت‌های رابط
├── public/                   # لوگو، آیکن‌ها، فونت وزیر، manifest، service worker
├── docs/                     # مستندات فنی و QA
└── .github/                  # Actions، قالب Issue و PR
```

## ⚠️ محدودیت‌ها

- ثبت‌نام ندارد؛ نشست ناشناس در کوکی HttpOnly است و بین دستگاه‌ها همگام نمی‌شود.
- تولید تصویر/ویدئو، اجرای کد و Deep Research پیاده‌سازی نشده‌اند.
- ورودی صوتی به Web Speech API مرورگر و HTTPS نیاز دارد.
- PWA جای APK بومی را نمی‌گیرد و برای پیام به اینترنت نیاز دارد.

جزئیات فنی کامل: [docs/TECHNICAL.fa.md](docs/TECHNICAL.fa.md) · گزارش تست: [docs/QA.md](docs/QA.md)

## 🤝 مشارکت

از مشارکتت خوشحال می‌شویم! قبل از ارسال Pull Request فایل [CONTRIBUTING.md](CONTRIBUTING.md) را بخوان.

1. Fork کن
2. یک branch بساز: `git checkout -b feature/amazing`
3. Commit کن: `git commit -m "feat: add amazing"`
4. Push و Pull Request باز کن

برای مسائل امنیتی [SECURITY.md](SECURITY.md) را ببین.

## 📄 مجوز

منتشرشده تحت مجوز [MIT](LICENSE). فونت وزیر تحت مجوز [OFL](public/fonts/OFL.txt).

---

## 🌐 English

**MindGPT** is a bilingual (Persian/English), RTL-first AI chat web app with a dark, minimal UI, installable as a PWA on Android. Models are called server-side through an OpenAI-compatible API, so your key never reaches the browser.

**Features:** streaming replies, Markdown/code/math, live model list, edit & retry, chat drawer with search/pin/archive/projects, image/PDF/DOCX uploads, voice input & read-aloud, light/dark themes, ICS reminders.

**Quick start**

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env   # set CODECRAFT_API_KEY
pnpm build && pnpm dev
```

**Download:** grab the latest build from [Releases](https://github.com/YOUR_USERNAME/MindGPT/releases/latest).
**Deploy:** Cloudflare Workers + D1 (`DB`) + R2 (`BUCKET`), via the *Deploy to Cloudflare* workflow.

<div align="center">

Made with 💙 · [Telegram](https://t.me/dev_vexel)

</div>
