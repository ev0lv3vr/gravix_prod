'use client';

import Link from 'next/link';
import { ArrowLeft, FlaskConical, Zap, FileSearch, Stethoscope, CheckCircle2 } from 'lucide-react';
import { type ProductPerformanceData } from '@/lib/mock-products';

// ============================================================================
// Bar Chart Component (simple horizontal bars)
// ============================================================================

function HorizontalBar({
  label,
  percent,
  color = 'bg-accent-500',
}: {
  label: string;
  percent: number;
  color?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#94A3B8]">{label}</span>
        <span className="text-white font-mono text-xs">{percent}%</span>
      </div>
      <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main View
// ============================================================================

export function ProductPerformanceView({
  product,
}: {
  product: ProductPerformanceData;
}) {
  const failureRateColor =
    product.performance.failureRate < 2
      ? 'text-emerald-400'
      : product.performance.failureRate <= 5
        ? 'text-yellow-400'
        : 'text-red-400';

  const failureRateLabel =
    product.performance.failureRate < 2
      ? '🟢 Low Risk'
      : product.performance.failureRate <= 10
        ? '🟡 Moderate Risk'
        : '🔴 High Risk';

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-accent-500 hover:text-accent-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All Products
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">
            {product.name}{' '}
            <span className="text-[#94A3B8] font-normal">— {product.manufacturer}</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <FlaskConical className="w-4 h-4 text-[#64748B]" />
            <span className="text-[#94A3B8]">{product.chemistry}</span>
          </div>
        </div>

        {/* Key Specifications Card */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-accent-500" />
            Key Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Viscosity', value: product.specs.viscosity },
              { label: 'Fixture Time', value: product.specs.fixtureTime },
              { label: 'Full Cure', value: product.specs.cureTime },
              { label: 'Shear Strength', value: product.specs.shearStrength },
              { label: 'Temp Range', value: product.specs.tempRange },
            ].map((spec) => (
              <div key={spec.label}>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-0.5">
                  {spec.label}
                </p>
                <p className="text-sm text-white font-mono">{spec.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center gap-2 text-xs text-[#64748B]">
            <span>Source: {product.specs.source}</span>
            {product.specs.verified && (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Field Performance Card */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-accent-500" />
            Field Performance
            <span className="text-xs text-[#64748B] font-normal ml-1">(Gravix Data)</span>
          </h2>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wider mb-0.5">
                Total Applications
              </p>
              <p className="text-2xl text-white font-mono font-bold">
                {product.performance.totalApplications}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wider mb-0.5">
                Field Failure Rate
              </p>
              <p className={`text-2xl font-mono font-bold ${failureRateColor}`}>
                {product.performance.failureRate}%
              </p>
              <p className="text-xs text-[#64748B] mt-0.5">{failureRateLabel}</p>
            </div>
          </div>

          {/* Failure Modes + Root Causes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Failure Modes */}
            <div>
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wider">
                Top Failure Modes
              </h3>
              <div className="space-y-3">
                {product.performance.failureModes.map((fm, i) => (
                  <HorizontalBar
                    key={fm.mode}
                    label={`${i + 1}. ${fm.mode}`}
                    percent={fm.percent}
                    color={
                      i === 0
                        ? 'bg-accent-500'
                        : i === 1
                          ? 'bg-accent-500/70'
                          : 'bg-accent-500/40'
                    }
                  />
                ))}
              </div>
            </div>

            {/* Root Causes */}
            <div>
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wider">
                Top Root Causes
              </h3>
              <div className="space-y-3">
                {product.performance.rootCauses.map((rc, i) => (
                  <HorizontalBar
                    key={rc.cause}
                    label={`${i + 1}. ${rc.cause}`}
                    percent={rc.percent}
                    color={
                      i === 0
                        ? 'bg-[#F59E0B]'
                        : i === 1
                          ? 'bg-[#F59E0B]/70'
                          : 'bg-[#F59E0B]/40'
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Common Application Errors */}
          <div>
            <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wider">
              Common Application Errors
            </h3>
            <ul className="space-y-2">
              {product.performance.applicationErrors.map((err) => (
                <li
                  key={err.error}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-[#F59E0B] mt-0.5">•</span>
                  <span className="text-[#94A3B8]">
                    {err.error}
                    <span className="text-[#64748B] ml-1">
                      ({err.percent}% of failures)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <p className="text-[#94A3B8] text-sm mb-3">
                Using {product.name} in production?
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/failure?product=${product.slug}`}
                  className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Get AI Failure Analysis →
                </Link>
                <Link
                  href={`/tool?product=${product.slug}`}
                  className="inline-flex items-center gap-2 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-[#374151] transition-colors"
                >
                  Generate Specification →
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F2937]">
              <p className="text-[#94A3B8] text-sm mb-3">
                Experiencing a failure with this product?
              </p>
              <Link
                href={`/failure?product=${product.slug}`}
                className="inline-flex items-center gap-2 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-[#374151] transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                Start Diagnosis with Product Pre-Selected →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#64748B] mt-8">
          All performance data is anonymized and aggregated from Gravix platform analyses.
          No company or facility names are disclosed.
        </p>
      </div>
    </div>
  );
}
