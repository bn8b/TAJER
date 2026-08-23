# TAJER V1 — Complete starter implementation
Arabic PWA for trading signals. No VPS is required for the frontend/Supabase architecture.

## Before production
1. Put Supabase URL + publishable/anon key in `js/config.js`.
2. Configure Supabase Auth phone OTP.
3. Run SQL migrations in order.
4. Create private Storage bucket `payment-screenshots`.
5. Deploy Edge Functions.
6. Configure a real market-data provider in `js/charts/chart-data.js`.
7. Create the first admin profile securely.
8. Never expose a Supabase service_role key in frontend code.

This package implements the application shell, auth flow, subscription gating, manual payment request flow, signal UI, admin UI, and database/RLS blueprint. Market-data provider credentials and the exact scalping rules must be supplied separately.
