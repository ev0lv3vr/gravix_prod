// Webhook trigger + Stripe signature signing logic

const crypto = require('crypto');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:8000/v1/billing/webhook';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';

function signPayload(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  return {
    header: `t=${timestamp},v1=${signature}`,
    timestamp,
    signature,
  };
}

function buildEvent(type, data) {
  const id = `evt_test_${Math.random().toString(36).substring(2, 14)}`;
  return {
    id,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  };
}

async function triggerWebhook(type, data) {
  const event = buildEvent(type, data);
  const payload = JSON.stringify(event);
  const { header } = signPayload(payload, STRIPE_WEBHOOK_SECRET);

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': header,
    },
    body: payload,
  });

  return {
    event,
    webhook_url: WEBHOOK_URL,
    status: response.status,
    response_body: await response.text().catch(() => null),
    signature_header: header,
  };
}

module.exports = { signPayload, buildEvent, triggerWebhook, WEBHOOK_URL, STRIPE_WEBHOOK_SECRET };
