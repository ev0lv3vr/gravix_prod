import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductPerformance, getAllProductPaths } from '@/lib/mock-products';
import { ProductPerformanceView } from '@/components/products/ProductPerformanceView';

// ============================================================================
// Static Params (for static generation / ISR)
// ============================================================================

export function generateStaticParams() {
  return getAllProductPaths();
}

// ============================================================================
// Dynamic Metadata (SEO)
// ============================================================================

interface PageProps {
  params: Promise<{ manufacturer: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { manufacturer, slug } = await params;
  const product = getProductPerformance(manufacturer, slug);

  if (!product) {
    return { title: 'Product Not Found | Gravix' };
  }

  return {
    title: `${product.name} Field Performance & Failure Analysis | Gravix`,
    description: `${product.name} by ${product.manufacturer} — ${product.performance.totalApplications} documented applications, ${product.performance.failureRate}% field failure rate. View failure modes, root causes, and common application errors from real production data.`,
    openGraph: {
      title: `${product.name} Field Performance | Gravix`,
      description: `Real production data: ${product.performance.totalApplications} applications, ${product.performance.failureRate}% failure rate. Top cause: ${product.performance.rootCauses[0]?.cause}.`,
    },
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ProductPerformancePage({ params }: PageProps) {
  const { manufacturer, slug } = await params;
  const product = getProductPerformance(manufacturer, slug);

  if (!product) {
    notFound();
  }

  return <ProductPerformanceView product={product} />;
}
