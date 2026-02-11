'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { FlaskConical, Search, ArrowRight, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  if (loading || !user) {
    return null;
  }
  const { used, limit } = useUsageTracking();

  const greeting = user?.email
    ? `Welcome back, ${user.email.split('@')[0]}`
    : 'Welcome back';

  // Mock recent analyses
  const recentAnalyses = [
    { id: '1', type: 'spec', substrates: 'Aluminum 6061 → ABS', result: 'Two-Part Epoxy', date: '2024-12-10', outcome: 'Confirmed' },
    { id: '2', type: 'failure', substrates: 'Steel 304 → Polycarbonate', result: 'Surface Prep Issue', date: '2024-12-09', outcome: 'Pending' },
    { id: '3', type: 'spec', substrates: 'HDPE → HDPE', result: 'Structural Acrylic', date: '2024-12-08', outcome: null },
  ];

  // Mock pending feedback
  const pendingFeedback = 2;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Component 6.1: Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">{greeting}</h1>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-accent-500/10 text-accent-500 text-xs font-semibold rounded-full uppercase">
            {user ? 'Free' : 'Guest'}
          </span>
          <span className="text-sm text-[#94A3B8] font-mono">{used}/{limit} analyses used</span>
        </div>
      </div>

      {/* Component 6.2: Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/tool" className="group bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500 transition-colors">
          <FlaskConical className="w-8 h-8 text-accent-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">New Material Spec</h3>
          <p className="text-sm text-[#94A3B8]">Generate a vendor-neutral adhesive specification</p>
          <span className="text-sm text-accent-500 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Start <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
        <Link href="/failure" className="group bg-brand-800 border border-[#1F2937] rounded-lg p-6 hover:border-accent-500 transition-colors">
          <Search className="w-8 h-8 text-accent-500 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Diagnose a Failure</h3>
          <p className="text-sm text-[#94A3B8]">Get ranked root causes with confidence scores</p>
          <span className="text-sm text-accent-500 mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            Start <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Component 6.4: Pending Feedback Banner */}
      {pendingFeedback > 0 && (
        <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-4 mb-8 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-accent-500 flex-shrink-0" />
          <p className="text-sm text-[#94A3B8]">
            You have <strong className="text-white">{pendingFeedback} analyses</strong> waiting for feedback.
          </p>
        </div>
      )}

      {/* Component 6.3: Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
          <Link href="/history" className="text-sm text-accent-500 hover:underline">View All →</Link>
        </div>
        <div className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1F2937]">
                <th className="text-left text-xs text-[#64748B] font-medium p-4">Type</th>
                <th className="text-left text-xs text-[#64748B] font-medium p-4">Substrates</th>
                <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Result</th>
                <th className="text-left text-xs text-[#64748B] font-medium p-4 hidden md:table-cell">Outcome</th>
                <th className="text-left text-xs text-[#64748B] font-medium p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map((a) => (
                <tr key={a.id} className="border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937] transition-colors cursor-pointer">
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      a.type === 'spec' ? 'bg-accent-500/10 text-accent-500' : 'bg-warning/10 text-warning'
                    }`}>
                      {a.type === 'spec' ? 'Spec' : 'Failure'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white">{a.substrates}</td>
                  <td className="p-4 text-sm text-[#94A3B8] hidden md:table-cell">{a.result}</td>
                  <td className="p-4 hidden md:table-cell">
                    {a.outcome ? (
                      <span className={`text-xs font-medium ${a.outcome === 'Confirmed' ? 'text-success' : 'text-warning'}`}>
                        {a.outcome}
                      </span>
                    ) : (
                      <span className="text-xs text-[#64748B]">—</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-[#64748B]">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
