const express = require('express');
const { store, generateId } = require('./store');
const { PLANS } = require('./plans');
const { triggerWebhook, buildEvent, signPayload, STRIPE_WEBHOOK_SECRET } = require('./webhooks');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.MOCK_STRIPE_PORT || 3300;

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[mock-stripe] ${req.method} ${req.path}`);
  next();
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

app.post('/v1/customers', (req, res) => {
  const id = generateId('cus');
  const now = Math.floor(Date.now() / 1000);
  const customer = {
    id,
    object: 'customer',
    email: req.body.email || null,
    name: req.body.name || null,
    metadata: req.body.metadata || {},
    created: now,
    livemode: false,
    description: req.body.description || null,
    subscriptions: { object: 'list', data: [], has_more: false, total_count: 0, url: `/v1/customers/${id}/subscriptions` },
  };
  store.customers[id] = customer;
  res.json(customer);
});

app.get('/v1/customers/:id', (req, res) => {
  const customer = store.customers[req.params.id];
  if (!customer) return res.status(404).json({ error: { message: `No such customer: '${req.params.id}'`, type: 'invalid_request_error' } });
  res.json(customer);
});

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

function createSubscription(body) {
  const id = generateId('sub');
  const now = Math.floor(Date.now() / 1000);
  const priceId = body.price || (body.items && body.items[0] && body.items[0].price) || 'price_pro_monthly';
  const plan = PLANS[priceId] || PLANS.price_pro_monthly;

  const subscription = {
    id,
    object: 'subscription',
    status: 'active',
    customer: body.customer || generateId('cus'),
    items: {
      object: 'list',
      data: [
        {
          id: `si_test_${Math.random().toString(36).substring(2, 10)}`,
          object: 'subscription_item',
          price: { ...plan },
          quantity: 1,
        },
      ],
      has_more: false,
      total_count: 1,
    },
    current_period_start: now,
    current_period_end: now + 30 * 24 * 60 * 60,
    cancel_at_period_end: false,
    canceled_at: null,
    metadata: body.metadata || {},
    livemode: false,
    created: now,
    latest_invoice: null,
  };

  store.subscriptions[id] = subscription;
  return subscription;
}

app.post('/v1/subscriptions', (req, res) => {
  const subscription = createSubscription(req.body);
  res.json(subscription);
});

app.get('/v1/subscriptions/:id', (req, res) => {
  const sub = store.subscriptions[req.params.id];
  if (!sub) return res.status(404).json({ error: { message: `No such subscription: '${req.params.id}'`, type: 'invalid_request_error' } });
  res.json(sub);
});

// Stripe uses POST for updates, but support both POST and PATCH (with a different handler for creation above)
app.post('/v1/subscriptions/:id', updateSubscription);
app.patch('/v1/subscriptions/:id', updateSubscription);

function updateSubscription(req, res) {
  const sub = store.subscriptions[req.params.id];
  if (!sub) return res.status(404).json({ error: { message: `No such subscription: '${req.params.id}'`, type: 'invalid_request_error' } });

  // Cancel at period end
  if (req.body.cancel_at_period_end !== undefined) {
    sub.cancel_at_period_end = req.body.cancel_at_period_end;
    if (req.body.cancel_at_period_end) {
      sub.canceled_at = Math.floor(Date.now() / 1000);
    } else {
      sub.canceled_at = null;
    }
  }

  // Change plan/price
  const newPrice = req.body.price || (req.body.items && req.body.items[0] && req.body.items[0].price);
  if (newPrice && PLANS[newPrice]) {
    sub.items.data[0].price = { ...PLANS[newPrice] };
  }

  // Update metadata
  if (req.body.metadata) {
    sub.metadata = { ...sub.metadata, ...req.body.metadata };
  }

  // Update status directly if provided
  if (req.body.status) {
    sub.status = req.body.status;
  }

  res.json(sub);
}

app.delete('/v1/subscriptions/:id', (req, res) => {
  const sub = store.subscriptions[req.params.id];
  if (!sub) return res.status(404).json({ error: { message: `No such subscription: '${req.params.id}'`, type: 'invalid_request_error' } });
  sub.status = 'canceled';
  sub.canceled_at = Math.floor(Date.now() / 1000);
  res.json(sub);
});

// ---------------------------------------------------------------------------
// Checkout Sessions
// ---------------------------------------------------------------------------

app.post('/v1/checkout/sessions', (req, res) => {
  const id = generateId('cs');
  const priceId = req.body.price || 'price_pro_monthly';

  // Auto-create a customer if email is provided
  let customerId = req.body.customer || null;
  if (!customerId && req.body.customer_email) {
    customerId = generateId('cus');
    store.customers[customerId] = {
      id: customerId,
      object: 'customer',
      email: req.body.customer_email,
      name: null,
      metadata: {},
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    };
  }

  // Auto-create a subscription
  const subscription = createSubscription({
    customer: customerId,
    price: priceId,
    metadata: req.body.metadata || {},
  });

  const successUrl = req.body.success_url || 'http://localhost:3000/success';
  const separator = successUrl.includes('?') ? '&' : '?';

  const session = {
    id,
    object: 'checkout.session',
    url: `${successUrl}${separator}session_id=${id}`,
    payment_status: 'unpaid',
    status: 'open',
    mode: req.body.mode || 'subscription',
    customer: customerId,
    customer_email: req.body.customer_email || null,
    subscription: subscription.id,
    metadata: req.body.metadata || {},
    success_url: req.body.success_url || null,
    cancel_url: req.body.cancel_url || null,
    livemode: false,
    created: Math.floor(Date.now() / 1000),
  };

  store.sessions[id] = session;
  res.json(session);
});

app.get('/v1/checkout/sessions/:id', (req, res) => {
  const session = store.sessions[req.params.id];
  if (!session) return res.status(404).json({ error: { message: `No such checkout session: '${req.params.id}'`, type: 'invalid_request_error' } });

  // Simulate completed payment on retrieval
  res.json({
    ...session,
    payment_status: 'paid',
    status: 'complete',
  });
});

// ---------------------------------------------------------------------------
// Webhook Trigger (test-only)
// ---------------------------------------------------------------------------

app.post('/v1/webhooks/trigger', async (req, res) => {
  const { type, data } = req.body;

  if (!type) {
    return res.status(400).json({ error: { message: 'Missing required field: type', type: 'invalid_request_error' } });
  }

  const supportedTypes = [
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ];

  if (!supportedTypes.includes(type)) {
    return res.status(400).json({
      error: {
        message: `Unsupported event type: '${type}'. Supported: ${supportedTypes.join(', ')}`,
        type: 'invalid_request_error',
      },
    });
  }

  // If no data provided, try to build from store
  let eventData = data;
  if (!eventData) {
    if (type === 'checkout.session.completed') {
      const sessionIds = Object.keys(store.sessions);
      if (sessionIds.length > 0) {
        const session = store.sessions[sessionIds[sessionIds.length - 1]];
        eventData = { ...session, payment_status: 'paid', status: 'complete' };
      }
    } else if (type.startsWith('customer.subscription.')) {
      const subIds = Object.keys(store.subscriptions);
      if (subIds.length > 0) {
        eventData = store.subscriptions[subIds[subIds.length - 1]];
      }
    }
  }

  if (!eventData) {
    return res.status(400).json({ error: { message: 'No data provided and no objects in store to use', type: 'invalid_request_error' } });
  }

  try {
    const result = await triggerWebhook(type, eventData);
    res.json(result);
  } catch (err) {
    // If the webhook target is unreachable, still return the event for testing
    const event = buildEvent(type, eventData);
    const payload = JSON.stringify(event);
    const { header } = signPayload(payload, STRIPE_WEBHOOK_SECRET);
    res.json({
      event,
      webhook_url: require('./webhooks').WEBHOOK_URL,
      status: 'unreachable',
      error: err.message,
      signature_header: header,
    });
  }
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mock-stripe', port: PORT });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[mock-stripe] Running on http://localhost:${PORT}`);
    console.log(`[mock-stripe] Webhook target: ${require('./webhooks').WEBHOOK_URL}`);
  });
}

module.exports = app;
