# MetalCloak customer app

A read-only iPhone and Android app for a MetalCloak store account. Customers sign in, see rewards points and history, review past and current orders (status, items, totals, tracking), and jump out to metalcloak.com to leave a product review.

The app is [Expo](https://docs.expo.dev/) (SDK 58) with Expo Router, so the same project runs in Expo Go, on the web, and as EAS builds for the App Store and Google Play. Version 1 does not check out, write reviews, or spend points.

**This repository does not call the live store.** The default data source is a fictional sample account. A Magento 2 client is included and stays off until you switch it on. Requests to `metalcloak.com` are refused unless `EXPO_PUBLIC_ALLOW_LIVE_STORE=true`.

## Sample account

| | |
| --- | --- |
| Email | `alex.rivera@example.com` |
| Password | `trailrated` |

Alex Rivera is not a real customer. The address, phone, order numbers, payment label, and tracking numbers are made up. A few prices match public “as low as” catalog figures; others are illustrative. Product links are public metalcloak.com pages so **Leave a review** opens a real review section. The in-app banner says **Sample data** whenever this source is active.

## Run

Requires Node.js 22+ and npm.

```bash
npm install
npm test
npm run typecheck
npx expo start
```

- Press `w` for the web preview, or run `npx expo start --web`.
- Scan the QR code with Expo Go (SDK 58) on a phone.
- `npm run ios` needs macOS and Xcode. `npm run android` needs an Android emulator or device.

`EXPO_PUBLIC_*` values are inlined when the bundle starts. Restart Expo after changing them.

## Layout

```
src/app/                 screens (Expo Router)
src/api/client.ts        picks mock or Magento
src/api/mock/            sample account
src/api/magento/         customer token, orders, response mappers
src/api/rewards/         Amasty rewards adapter
src/auth/                session token (SecureStore on device, localStorage on web)
```

`StoreClient` is the only store surface the screens use: `login`, `getCustomer`, `getOrders`, `getOrder`, `getRewards`. There is no write method for cart, checkout, reviews, or points.

## Switch to a Magento store

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_DATA_SOURCE=magento`.
3. Set `EXPO_PUBLIC_MAGENTO_BASE_URL` to the store origin (no trailing slash).
4. Leave `EXPO_PUBLIC_ALLOW_LIVE_STORE` unset or `false` until access is confirmed. With the flag off, a host of `metalcloak.com` throws before any request is sent. Any other host (a staging box you control) is allowed.
5. Restart Expo and sign in with a real customer email and password.

Native apps are not subject to browser CORS. The Expo **web** preview will fail against Magento unless that store sends `Access-Control-Allow-Origin` for the dev origin. A failed web preview does not mean the iOS or Android build will fail.

The committed EAS profiles do not set these variables, so a build from this repo stays on sample data until you add them to the EAS production environment (see below).

## Magento and Amasty access

Authentication is the customer token, not an admin integration:

`POST /rest/V1/integration/customer/token` with `{ "username", "password" }`. The token is sent as `Authorization: Bearer`.

| Data | Call | Who can use it |
| --- | --- | --- |
| Profile | `GET /rest/V1/customers/me` | Customer token (`self`) |
| Orders (default) | GraphQL `customer { orders }` on `POST /graphql` | Customer token on Magento 2.4.4+. Query is in `src/api/magento/ordersQuery.ts`. First 50 orders. |
| Orders (alternate) | `GET /rest/V1/orders` filtered by `customer_id` | Admin ACL `Magento_Sales::actions_view` unless a custom `webapi.xml` grants it. A normal customer token gets 401. Set `EXPO_PUBLIC_ORDERS_API=rest` only if that grant exists. |
| Rewards | See below | Customer token, if the extension exposes it to `self` |

Optional `EXPO_PUBLIC_MAGENTO_STORE_CODE` is sent as the Magento `Store` header when the site is not the default store view.

### Rewards (Amasty hypothesis)

The public site exposes `rewards/cart/apply` and `rewards/cart/remove`. Those are Amasty Reward Points **checkout** controllers. This app does not call them. It only reads a balance and a history.

Amasty’s published customer API, which this build treats as the default and still needs to be confirmed on this store’s extension version:

- `GET /rest/V1/rewards/mine/balance`
- `GET /rest/V1/rewards/mine/history`

Both should be `self` resources on the customer token. Do not call the admin routes under `/rest/V1/rewards/management` from the app.

If this store’s payload differs, the mappers in `src/api/rewards/mapRewards.ts` already accept a number, `{ balance }`, `{ points }`, `{ customer_balance: { points, currency_amount } }`, and a history list under `items`, `history`, or `transactions` (amount, comment, action, action date). An unrecognized body throws with the keys it saw so the mapper can be extended without touching the screens.

`EXPO_PUBLIC_REWARDS_PROFILE`:

| Value | Behavior |
| --- | --- |
| `amasty-rest` (default) | GET the balance and history paths above. Override the paths with `EXPO_PUBLIC_REWARDS_BALANCE_PATH` and `EXPO_PUBLIC_REWARDS_HISTORY_PATH`. |
| `custom` | Same REST client, for a non-Amasty path that still returns a mappable balance and history. |
| `amasty-graphql` | POST `/graphql` with the `rewards` query in `src/api/rewards/amasty.ts`. That field list is a starting point. If the store returns a schema error, introspect `rewards` and edit `AMASTY_REWARDS_QUERY`. |

Dollar value is shown only when the payload includes a currency amount. The sample account uses 100 points = $1.00 and says so. A live store should send its own conversion; the app does not invent one.

## Publish to the App Store and Google Play

Ship with EAS Build and EAS Submit. You do not need a local Xcode or Android Studio install to produce the binaries.

1. Enroll the MetalCloak Apple Developer account and Google Play Console account.
2. Confirm the bundle id `com.metalcloak.customer` and the package `com.metalcloak.customer`, or change both in `app.json` before the first build. They have to stay stable after the stores accept them.
3. `npx eas-cli@latest login` and `npx eas-cli@latest init`. Init writes `extra.eas.projectId` into `app.json`.
4. Confirm Magento and Amasty access with a real customer, against staging if you have it.
5. In the Expo project, set the **production** environment variables, then build. Until you do, production builds stay on sample data:

   ```bash
   EXPO_PUBLIC_DATA_SOURCE=magento
   EXPO_PUBLIC_MAGENTO_BASE_URL=https://www.metalcloak.com
   EXPO_PUBLIC_STORE_WEB_ORIGIN=https://www.metalcloak.com
   EXPO_PUBLIC_REWARDS_PROFILE=amasty-rest
   EXPO_PUBLIC_ALLOW_LIVE_STORE=true
   ```

   Set `EXPO_PUBLIC_ALLOW_LIVE_STORE` only after that access is confirmed. Do not give App Review the sample password; create a demo customer on the store.

6. `npx eas-cli@latest build --profile production --platform all`
7. Create the App Store Connect app and the Play Console app, then `npx eas-cli@latest submit --profile production --platform ios` and `--platform android`.

`eas.json` also has a `preview` profile (internal APK, iOS simulator) and a `development` profile (dev client).

Store listing notes for v1:

- The app sends the customer’s email and password to the configured Magento store to obtain a token, keeps that token on the device, and displays the customer’s name, orders, and rewards. It does not include third-party analytics or advertising.
- Apple’s export questionnaire can use the exemption already set in `app.json` (`ITSAppUsesNonExemptEncryption: false`). The app only uses HTTPS.
- Both stores require a privacy policy URL. Host one that matches the data above.
- App Review needs a working demo customer and a note that reviews open in the browser on purpose.
- Screenshots: capture the phone UI (Expo Go or a simulator). The web preview is a centered phone column, useful for layout, not a substitute for store screenshots.
- Checkout, point redemption, and writing a review stay on metalcloak.com. Say that in the review notes so the missing commerce features are not treated as bugs.

## Not in v1

In-app review forms, checkout, applying or removing reward points, wishlists, and fitment. The **Leave a review** button only opens the product’s `#reviews` anchor (or a catalog search when a product has no URL).
