# Sales Email Monitor — Configuration

## Monitored Account
- Account: sales@gluemasters.com (himalaya account: sales)

## Classification Rules

### B2B Lead (→ MoneySamurai + Telegram alert)
- Subject contains "B2B" or body contains company/industry/volume fields
- From domain is not gmail/yahoo/hotmail/outlook (corporate email)
- Mentions production, manufacturing, bulk, wholesale, volume, dispensing
- Shopify form with "B2B Production Trial Request" subject line

### Customer Issue (→ Telegram alert)
- Order complaints, wrong product, shipping issues
- Returns/refunds requests
- Product questions from existing customers

### Noise (→ ignore)
- Shopify payout notifications
- Marketing emails
- Delivery status notifications from mail system
- Bank/financial notifications

## Last Processed ID
5644

## MoneySamurai Supabase
- URL: https://drryqdpanjndkmlgcrna.supabase.co
- User ID: fdcb5d9b-fc47-4002-b57a-096bdf8807d8
