# راهنمای استقرار در Cloudflare Pages

## پیش‌نیازها

1. **حساب Cloudflare**: یک حساب رایگان در [Cloudflare](https://dash.cloudflare.com) ایجاد کنید.
2. **Wrangler CLI**: ابزار خط فرمان Cloudflare را نصب کنید:
   ```bash
   npm install -g wrangler
   ```
3. **ورود به حساب**:
   ```bash
   wrangler login
   ```

## مراحل استقرار

### ۱. ایجاد KV Namespace

```bash
wrangler kv:namespace create "STORE_KV"
```

خروجی شبیه به این خواهد بود:
```
{ binding = "STORE_KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

آن `id` را در فایل `wrangler.json` در قسمت `kv_namespaces` قرار دهید:
```json
"kv_namespaces": [
  {
    "binding": "STORE_KV",
    "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
]
```

### ۲. ساخت پروژه

```bash
npm install
npm run build
```

### ۳. استقرار در Cloudflare Pages

```bash
wrangler pages deploy dist
```

یا برای اولین بار:
```bash
npm run deploy:init
npm run deploy
```

### ۴. تنظیمات پروژه در داشبورد Cloudflare

پس از استقرار اولیه:
1. به [Cloudflare Dashboard](https://dash.cloudflare.com) بروید
2. Pages > پروژه خود را انتخاب کنید
3. در بخش Settings > Functions، KV Namespace را متصل کنید
4. در بخش Settings > Build & Deploy، مطمئن شوید Build Command خالی است (چون از قبل build کرده‌اید)

## ساختار پروژه پس از استقرار

```
dist/
├── index.html              # صفحه ورودی React
├── assets/                 # فایل‌های استاتیک (JS, CSS)
└── functions/
    └── api/
        └── sync.js         # تابع همگام‌سازی با KV
```

## توسعه محلی

### با Vite (فقط Frontend)
```bash
npm run dev
```
سرور در `http://localhost:3000` اجرا می‌شود.

### با Express (Full-stack Simulation)
```bash
npm run server
```
سرور محلی در `http://localhost:8788` اجرا می‌شود و API همگام‌سازی را شبیه‌سازی می‌کند.

### با Wrangler (شبیه‌سازی Cloudflare)
```bash
wrangler pages dev dist
```

## متغیرهای محیطی

| متغیر | توضیحات |
|-------|---------|
| `STORE_KV` | Namespace KV برای ذخیره‌سازی داده‌ها |

## نکات مهم

- داده‌ها به صورت پیش‌فرض در **LocalStorage** مرورگر ذخیره می‌شوند.
- همگام‌سازی ابری از طریق **Cloudflare KV** انجام می‌شود.
- تابع `sync.ts` در مسیر `functions/api/` قرار دارد و به صورت Serverless اجرا می‌شود.
- رمز عبور پیش‌فرض: `admin123` (در تنظیمات قابل تغییر است).

## عیب‌یابی

### خطای KV Namespace
مطمئن شوید که `id` در `wrangler.json` صحیح وارد شده است.

### خطای CORS
تنظیمات CORS در تابع `sync.ts` فعال است. در صورت مشکل، دامنه خود را به لیست مجاز اضافه کنید.

### داده‌ها همگام نمی‌شوند
1. مرورگر را رفرش کنید
2. LocalStorage را بررسی کنید
3. در بخش Cloudflare Dashboard > KV، داده‌ها را بررسی کنید
