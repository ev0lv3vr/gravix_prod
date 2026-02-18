import { usePlan } from '@/contexts/PlanContext';

const MINIMUM_PLAN: Record<string, string> = {
  'analysis.photos': 'pro',
  'history.export_pdf': 'pro',
  'cases.details': 'pro',
  'products.extract_tds': 'pro',
  'investigations.create': 'quality',
  'investigations.view': 'quality',
  'intelligence.alerts': 'quality',
  'platform.sso': 'enterprise',
};

const TIER_ORDER = ['free', 'pro', 'quality', 'team', 'enterprise'];

export function usePlanGate(gateKey: string) {
  const { plan, isAdmin } = usePlan();
  if (isAdmin) return { allowed: true, requiredPlan: null };

  const requiredPlan = MINIMUM_PLAN[gateKey] || 'pro';
  const userLevel = TIER_ORDER.indexOf(plan);
  const requiredLevel = TIER_ORDER.indexOf(requiredPlan);
  const allowed = userLevel >= requiredLevel;

  return { allowed, requiredPlan: allowed ? null : requiredPlan };
}
