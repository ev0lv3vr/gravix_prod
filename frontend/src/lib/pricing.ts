const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gravix-prod.onrender.com';

export type PlanKey = 'free' | 'pro' | 'quality' | 'enterprise';

export type PlanPricingResponse = {
  source: 'stripe' | 'cache' | 'default';
  currency: 'usd' | string;
  plans: Record<PlanKey, { monthly: number }>;
};

export const DEFAULT_PLAN_PRICES: Record<PlanKey, number> = {
  free: 0,
  pro: 79,
  quality: 299,
  enterprise: 799,
};

export async function fetchPlanPricing(): Promise<Record<PlanKey, number>> {
  try {
    const response = await fetch(`${API_URL}/api/pricing/plans`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Pricing endpoint failed: ${response.status}`);

    const json = (await response.json()) as PlanPricingResponse;
    return {
      free: json.plans?.free?.monthly ?? DEFAULT_PLAN_PRICES.free,
      pro: json.plans?.pro?.monthly ?? DEFAULT_PLAN_PRICES.pro,
      quality: json.plans?.quality?.monthly ?? DEFAULT_PLAN_PRICES.quality,
      enterprise: json.plans?.enterprise?.monthly ?? DEFAULT_PLAN_PRICES.enterprise,
    };
  } catch {
    return DEFAULT_PLAN_PRICES;
  }
}

export function formatUsd(monthly: number): string {
  return `$${monthly}`;
}
