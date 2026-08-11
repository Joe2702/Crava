# Crava

Bilingual (English / Arabic) skills-training app. Users work through a leveled
skill path of video drills, tracking XP and streaks, gated behind a Pro
subscription.

## Repository layout

```
mobile/   Expo (React Native) app — the product
web/      Vite React app — the original design port; becomes the
          marketing site and full-margin web checkout
```

## v1 scope

Deliberately narrow: **Full Muscle-Up only, six levels, subscription only.**
No coach marketplace, no community feed — those are deferred until the core
loop is proven.

## Backend

Supabase project `crava` (`lzigkduqkkmfawlcczuf`, eu-central-1).

Content lives in `skills` / `levels` / `drills`. Per-user state lives in
`profiles`, `user_stats`, `user_drill_completions`, `user_level_completions`,
and `entitlements`. RLS is on for every table; users can only touch their own
rows, and content is readable only when `is_published`.

Level completion goes through the `complete_level(uuid)` RPC rather than direct
writes, so XP and streaks cannot be minted by a client. It refuses to complete a
level whose required drills are unfinished, and replaying a finished level
awards nothing. `entitlements` has no client write policy — only the RevenueCat
webhook (service role) may write it.

## Running the mobile app

```bash
cd mobile
cp .env.example .env      # fill in the publishable key
npm install
npx expo start
```

The Supabase publishable key is safe to ship in the bundle — it is protected by
RLS, not secrecy.

## Running the web app

```bash
cd web
npm install
npm run dev
```

## Still to do before launch

- Film and upload the six lesson videos; wire a video host (Mux / Cloudflare Stream)
- RevenueCat + App Store / Play subscription products
- Arabic typography (bundle IBM Plex Sans Arabic) and native RTL
- Port remaining screens: onboarding, profile, paywall
- Privacy policy, terms, account deletion (Apple requires it)
- Push notifications for session reminders and streaks
