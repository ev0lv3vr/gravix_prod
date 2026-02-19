// In-memory store for mock Stripe objects

const store = {
  customers: {},
  subscriptions: {},
  sessions: {},
};

let counters = {
  customer: 0,
  subscription: 0,
  session: 0,
};

function generateId(prefix) {
  counters[prefix] = (counters[prefix] || 0) + 1;
  const rand = Math.random().toString(36).substring(2, 14);
  return `${prefix}_test_${rand}${counters[prefix]}`;
}

function reset() {
  store.customers = {};
  store.subscriptions = {};
  store.sessions = {};
  counters = { customer: 0, subscription: 0, session: 0 };
}

module.exports = { store, generateId, reset };
