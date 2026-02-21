'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Search } from 'lucide-react';

type AdminUser = Awaited<ReturnType<typeof api.getAdminUsers>>[number];

const PLANS = ['free', 'pro', 'team'] as const;

function PlanBadge({
  plan,
  userId,
  onUpdate,
}: {
  plan: string;
  userId: string;
  onUpdate: (userId: string, plan: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const color =
    plan === 'pro'
      ? 'bg-success/20 text-success border-success/30'
      : plan === 'team'
      ? 'bg-info/20 text-info border-info/30'
      : 'bg-brand-700 text-text-secondary border-brand-600';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`px-2 py-0.5 text-xs font-mono rounded border cursor-pointer hover:opacity-80 ${color}`}
      >
        {plan}
      </button>
      {open && (
        <div className="absolute z-10 top-full mt-1 left-0 bg-brand-800 border border-brand-600 rounded shadow-lg py-1 min-w-[80px]">
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => {
                onUpdate(userId, p);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-brand-700 ${
                p === plan ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleBadge({
  role,
  userId,
  onToggle,
}: {
  role: string | null | undefined;
  userId: string;
  onToggle: (userId: string, newRole: string) => void;
}) {
  const isAdmin = role === 'admin';
  return (
    <button
      onClick={() => onToggle(userId, isAdmin ? 'user' : 'admin')}
      className={`px-2 py-0.5 text-xs font-mono rounded border cursor-pointer hover:opacity-80 ${
        isAdmin
          ? 'bg-danger/20 text-danger border-danger/30'
          : 'bg-brand-700 text-text-secondary border-brand-600'
      }`}
    >
      {isAdmin ? 'admin' : 'user'}
    </button>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadUsers = useCallback((q?: string) => {
    setLoading(true);
    api
      .getAdminUsers(q || undefined)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadUsers(value), 300);
  };

  const handlePlanUpdate = async (userId: string, plan: string) => {
    try {
      await api.updateAdminUser(userId, { plan });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
    } catch {
      // silently fail — could add toast
    }
  };

  const handleRoleToggle = async (userId: string, newRole: string) => {
    try {
      await api.updateAdminUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch {
      // silently fail
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-mono text-white">Users</h1>
        <span className="text-xs text-text-tertiary font-mono">{users.length} total</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-brand-800 border border-brand-600 rounded text-sm text-white placeholder:text-text-tertiary focus:outline-none focus:border-accent-500"
        />
      </div>

      {/* Table */}
      <div className="bg-brand-800 border border-brand-600 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-600">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Role</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Analyses</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Specs</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-text-tertiary text-sm">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-brand-700 hover:bg-brand-700/30">
                  <td className="px-4 py-3 text-white font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{u.name || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{u.company || '—'}</td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={u.plan} userId={u.id} onUpdate={handlePlanUpdate} />
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} userId={u.id} onToggle={handleRoleToggle} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                    {u.analyses_this_month}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                    {u.specs_this_month}
                  </td>
                  <td className="px-4 py-3 text-text-tertiary text-xs">{formatDate(u.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
