export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-line bg-ink text-paper/80">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-display text-lg text-paper">CouponHub</p>
            <p className="mt-1 max-w-sm text-paper/60">Real deals, listed by real people. Buy, sell, and share coupons, vouchers, and gift cards.</p>
          </div>
          <div className="text-paper/60">
            <p>Phase 1 build — Auth, Coupons, Categories &amp; Brands are live.</p>
            <p>Payments, wallet, chat, and reviews are coming in later phases.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
