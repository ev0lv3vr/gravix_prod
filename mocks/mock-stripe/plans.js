// Pre-configured Gravix plans matching Stripe price objects

const PLANS = {
  price_pro_monthly: {
    id: 'price_pro_monthly',
    object: 'price',
    product: 'prod_pro',
    unit_amount: 7900,
    currency: 'usd',
    recurring: { interval: 'month', interval_count: 1 },
    type: 'recurring',
    active: true,
    nickname: 'Pro Monthly',
  },
  price_quality_monthly: {
    id: 'price_quality_monthly',
    object: 'price',
    product: 'prod_quality',
    unit_amount: 29900,
    currency: 'usd',
    recurring: { interval: 'month', interval_count: 1 },
    type: 'recurring',
    active: true,
    nickname: 'Quality/Team Monthly',
  },
  price_enterprise_monthly: {
    id: 'price_enterprise_monthly',
    object: 'price',
    product: 'prod_enterprise',
    unit_amount: 79900,
    currency: 'usd',
    recurring: { interval: 'month', interval_count: 1 },
    type: 'recurring',
    active: true,
    nickname: 'Enterprise Monthly',
  },
};

const PRODUCTS = {
  prod_pro: {
    id: 'prod_pro',
    object: 'product',
    name: 'Gravix Pro',
    active: true,
  },
  prod_quality: {
    id: 'prod_quality',
    object: 'product',
    name: 'Gravix Quality/Team',
    active: true,
  },
  prod_enterprise: {
    id: 'prod_enterprise',
    object: 'product',
    name: 'Gravix Enterprise',
    active: true,
  },
};

module.exports = { PLANS, PRODUCTS };
