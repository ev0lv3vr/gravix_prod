'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { investigationsApi, type InvestigationCreatePayload, type InvestigationSeverity, type ReportTemplate } from '@/lib/investigations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateInvestigationPage() {
  return (
    <Suspense fallback={null}>
      <CreateInvestigationContent />
    </Suspense>
  );
}

function CreateInvestigationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const analysisId = searchParams.get('analysis_id') || undefined;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<InvestigationSeverity>('major');
  const [customerOem, setCustomerOem] = useState('');
  const [productPartNumber, setProductPartNumber] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [whoReported, setWhoReported] = useState('');
  const [whereInProcess, setWhereInProcess] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [howDetected, setHowDetected] = useState('');
  const [howManyAffected, setHowManyAffected] = useState('');
  const [reportTemplate, setReportTemplate] = useState('');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  // Fetch templates
  useEffect(() => {
    investigationsApi.listTemplates().then(setTemplates).catch(() => {});
  }, []);

  if (authLoading) return null;
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: InvestigationCreatePayload = {
        title: title.trim(),
        severity,
      };
      if (customerOem.trim()) payload.customer_oem = customerOem.trim();
      if (productPartNumber.trim()) payload.product_part_number = productPartNumber.trim();
      if (whatFailed.trim()) payload.what_failed = whatFailed.trim();
      if (whoReported.trim()) payload.who_reported = whoReported.trim();
      if (whereInProcess.trim()) payload.where_in_process = whereInProcess.trim();
      if (whyItMatters.trim()) payload.why_it_matters = whyItMatters.trim();
      if (howDetected.trim()) payload.how_detected = howDetected.trim();
      if (howManyAffected.trim()) payload.how_many_affected = parseInt(howManyAffected, 10) || undefined;
      if (analysisId) payload.analysis_id = analysisId;
      if (reportTemplate) payload.report_template = reportTemplate;

      const created = await investigationsApi.create(payload);
      router.push(`/investigations/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create investigation');
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      {/* Back link */}
      <Link
        href="/investigations"
        className="inline-flex items-center text-sm text-[#94A3B8] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Investigations
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">New Investigation</h1>
      <p className="text-sm text-[#94A3B8] mb-8">
        Start a new 8D quality investigation. Fill in the details below.
        {analysisId && ' Pre-filling from your failure analysis.'}
      </p>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">
            Title <span className="text-danger">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bond failure on customer XYZ — Line 3"
            className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
            required
          />
        </div>

        {/* Severity + Customer (row) */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">
              Severity <span className="text-danger">*</span>
            </Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as InvestigationSeverity)}>
              <SelectTrigger className="bg-brand-800 border-[#1F2937] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical — Safety / line stop</SelectItem>
                <SelectItem value="major">Major — Significant quality impact</SelectItem>
                <SelectItem value="minor">Minor — Low impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-white">Customer / OEM</Label>
            <Input
              id="customer"
              value={customerOem}
              onChange={(e) => setCustomerOem(e.target.value)}
              placeholder="e.g. Toyota, Boeing"
              className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
            />
          </div>
        </div>

        {/* Product */}
        <div className="space-y-2">
          <Label htmlFor="product" className="text-white">Product / Part Number</Label>
          <Input
            id="product"
            value={productPartNumber}
            onChange={(e) => setProductPartNumber(e.target.value)}
            placeholder="e.g. P/N 12345-A"
            className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
          />
        </div>

        {/* Report Template */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <Label className="text-white">Report Template</Label>
            <Select value={reportTemplate} onValueChange={setReportTemplate}>
              <SelectTrigger className="bg-brand-800 border-[#1F2937] text-white">
                <SelectValue placeholder="Select a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.slug}>
                    {t.name}{t.oem_standard ? ` — ${t.oem_standard}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templates.find((t) => t.slug === reportTemplate)?.description && (
              <p className="text-xs text-[#64748B]">
                {templates.find((t) => t.slug === reportTemplate)?.description}
              </p>
            )}
          </div>
        )}

        {/* D2: Problem Description */}
        <div className="border-t border-[#1F2937] pt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Problem Description (D2)</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatFailed" className="text-white">What failed?</Label>
              <Textarea
                id="whatFailed"
                value={whatFailed}
                onChange={(e) => setWhatFailed(e.target.value)}
                placeholder="Describe the failure or defect..."
                rows={3}
                className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whoReported" className="text-white">Who reported it?</Label>
                <Input
                  id="whoReported"
                  value={whoReported}
                  onChange={(e) => setWhoReported(e.target.value)}
                  placeholder="Name or department"
                  className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whereInProcess" className="text-white">Where in process?</Label>
                <Input
                  id="whereInProcess"
                  value={whereInProcess}
                  onChange={(e) => setWhereInProcess(e.target.value)}
                  placeholder="e.g. Assembly Line 3, Incoming QC"
                  className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyItMatters" className="text-white">Why it matters</Label>
              <Input
                id="whyItMatters"
                value={whyItMatters}
                onChange={(e) => setWhyItMatters(e.target.value)}
                placeholder="Business impact / urgency"
                className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="howDetected" className="text-white">How detected?</Label>
                <Input
                  id="howDetected"
                  value={howDetected}
                  onChange={(e) => setHowDetected(e.target.value)}
                  placeholder="e.g. Visual inspection, test failure"
                  className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="howMany" className="text-white">How many affected?</Label>
                <Input
                  id="howMany"
                  type="number"
                  value={howManyAffected}
                  onChange={(e) => setHowManyAffected(e.target.value)}
                  placeholder="e.g. 150"
                  className="bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={submitting || !title.trim()}
            className="bg-accent-500 hover:bg-accent-600 text-white"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Investigation
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-[#94A3B8]"
            onClick={() => router.push('/investigations')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
