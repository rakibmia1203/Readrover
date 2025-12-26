# ReadRover

**Smarter picks. Faster delivery.**

ReadRover is a portfolio-grade **Next.js (App Router) + Prisma** online bookstore with real conversion features:

- Auth (login/register) + role-based access
- Shop with search, filters, and sorting
- Book details + reviews
- Cart + coupons (DB-backed validation)
- Address book (saved delivery addresses)
- Contact form + Admin inbox
- Admin analytics (orders/revenue/top books)
- Checkout (COD demo) + order success page
- Order tracking (order no + phone)
- Watchlist (price-drop alerts flow)
- Discover (recently viewed + smart picks)
- BookMatch (quiz-based recommendations)
- Admin panel (books, orders, analytics, coupons, inbox)
- Newsletter subscription (footer)

## Run locally (VS Code)

1) Open this folder in VS Code
2) Open **Terminal** and run:

```bash
npm install
cp .env.example .env

npx prisma generate
npx prisma db push  # applies schema incl. ContactMessage
npm run db:seed

npm run dev
```

Open: `http://localhost:3000`

## Default admin

Set these in `.env` (copied from `.env.example`) before seeding:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Admin login: `http://localhost:3000/admin-login`


## Manage books

Open: `http://localhost:3000/admin/books`

- Add new books (with cover URL)
- Edit price/salePrice (discount % auto)
- Activate/Deactivate (inactive books are hidden from the shop)
- Delete (if a book has orders, deletion is blocked—use Deactivate instead)
