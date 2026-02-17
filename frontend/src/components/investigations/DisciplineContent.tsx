'use client';

import { useState } from 'react';
import type {
  Investigation,
  InvestigationAction,
  InvestigationSignature,
} from '@/lib/investigations';
import { getTeamMemberName } from '@/lib/mock-investigations';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  CheckCircle,
  Loader2,
  PenLine,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface DisciplineContentProps {
  discipline: string;
  investigation: Investigation;
  actions: InvestigationAction[];
  signatures: InvestigationSignature[];
  analyzing: boolean;
  signing: string | null;
  onAnalyze: () => Promise<void>;
  onSign: (discipline: string) => Promise<void>;
  onAddAction: (discipline: string) => void;
}

export function DisciplineContent({
  discipline,
  investigation,
  actions,
  signatures,
  analyzing,
  signing,
  onAnalyze,
  onSign,
  onAddAction,
}: DisciplineContentProps) {
  const signed = signatures.some((s) => s.discipline === discipline);
  const disciplineActions = actions.filter((a) => a.discipline === discipline);

  return (
    <div className="p-6 space-y-6">
      {discipline === 'D1' && <D1TeamFormation investigation={investigation} />}
      {discipline === 'D2' && <D2ProblemDescription investigation={investigation} />}
      {discipline === 'D3' && (
        <D3ContainmentActions actions={disciplineActions} onAddAction={() => onAddAction('D3')} />
      )}
      {discipline === 'D4' && (
        <D4RootCause
          investigation={investigation}
          onAnalyze={onAnalyze}
          analyzing={analyzing}
        />
      )}
      {discipline === 'D5' && (
        <D5CorrectiveActions actions={disciplineActions} onAddAction={() => onAddAction('D5')} />
      )}
      {discipline === 'D6' && <D6Verification actions={disciplineActions} />}
      {discipline === 'D7' && (
        <D7PreventiveActions actions={disciplineActions} onAddAction={() => onAddAction('D7')} />
      )}
      {discipline === 'D8' && <D8Closure investigation={investigation} />}

      {/* Sign-off */}
      <div className="pt-4 border-t border-[#1F2937]">
        {signed ? (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{discipline} signed off</span>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="text-success hover:text-success/80"
            onClick={() => onSign(discipline)}
            disabled={signing === discipline}
          >
            {signing === discipline ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Sign Off {discipline}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── D1: Team Formation ──────────────────────────────────────────────────────

function D1TeamFormation({ investigation }: { investigation: Investigation }) {
  const members = [
    { role: 'Team Lead', userId: investigation.team_lead_user_id },
    { role: 'Champion', userId: investigation.champion_user_id },
    { role: 'Approver', userId: investigation.approver_user_id },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D1 — Establish the Team</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Identify team members with relevant expertise. Define roles and responsibilities.
      </p>

      <div className="space-y-3">
        {members.map(({ role, userId }) => (
          <div
            key={role}
            className="flex items-center gap-3 bg-[#0A1628] rounded-lg border border-[#1F2937] p-3"
          >
            <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-xs text-accent-500 font-semibold flex-shrink-0">
              {getTeamMemberName(userId).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">
                {getTeamMemberName(userId)}
              </p>
              <p className="text-xs text-[#64748B]">{role}</p>
            </div>
            {userId && (
              <Badge variant="success" className="text-[10px] py-0">Assigned</Badge>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-[#64748B] mt-4">
        Additional team members can be added from the sidebar.
      </p>
    </div>
  );
}

// ─── D2: Problem Description ─────────────────────────────────────────────────

function D2ProblemDescription({ investigation }: { investigation: Investigation }) {
  const fields = [
    { label: 'What failed?', value: investigation.what_failed },
    { label: 'Who reported?', value: investigation.who_reported },
    { label: 'Where in process?', value: investigation.where_in_process },
    { label: 'When detected?', value: investigation.when_detected },
    { label: 'How detected?', value: investigation.how_detected },
    { label: 'Why it matters', value: investigation.why_it_matters },
    { label: 'How many affected?', value: investigation.how_many_affected?.toString() },
  ];

  const hasData = fields.some((f) => f.value);

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D2 — Describe the Problem</h3>
      <p className="text-sm text-[#64748B] mb-6">
        5W2H problem description: Who, What, Where, When, Why, How, How Many.
      </p>

      {investigation.analysis_id && (
        <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-accent-500 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            Auto-filled from linked analysis
          </p>
        </div>
      )}

      {hasData ? (
        <div className="space-y-4">
          {fields.map(
            ({ label, value }) =>
              value && (
                <div key={label}>
                  <p className="text-xs text-[#64748B] font-medium mb-1">{label}</p>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{value}</p>
                </div>
              )
          )}

          {(investigation.defect_quantity || investigation.scrap_cost || investigation.rework_cost) && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {investigation.defect_quantity != null && (
                <div className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-3 text-center">
                  <p className="text-lg font-bold text-white">{investigation.defect_quantity}</p>
                  <p className="text-[10px] text-[#64748B] uppercase">Defects</p>
                </div>
              )}
              {investigation.scrap_cost != null && (
                <div className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-3 text-center">
                  <p className="text-lg font-bold text-white">${investigation.scrap_cost.toLocaleString()}</p>
                  <p className="text-[10px] text-[#64748B] uppercase">Scrap Cost</p>
                </div>
              )}
              {investigation.rework_cost != null && (
                <div className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-3 text-center">
                  <p className="text-lg font-bold text-white">${investigation.rework_cost.toLocaleString()}</p>
                  <p className="text-[10px] text-[#64748B] uppercase">Rework Cost</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#64748B] italic">No problem description entered yet.</p>
      )}
    </div>
  );
}

// ─── D3: Containment Actions ─────────────────────────────────────────────────

function D3ContainmentActions({
  actions,
  onAddAction,
}: {
  actions: InvestigationAction[];
  onAddAction: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D3 — Interim Containment</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Immediate actions to protect the customer while root cause is investigated.
      </p>

      <ActionList actions={actions} emptyText="No containment actions defined yet." />

      <Button
        variant="ghost"
        className="text-accent-500 hover:text-accent-400 mt-4"
        onClick={onAddAction}
      >
        <PenLine className="w-4 h-4 mr-2" />
        Add Containment Action
      </Button>
    </div>
  );
}

// ─── D4: Root Cause Analysis ─────────────────────────────────────────────────

function D4RootCause({
  investigation,
  onAnalyze,
  analyzing,
}: {
  investigation: Investigation;
  onAnalyze: () => Promise<void>;
  analyzing: boolean;
}) {
  const [showIshikawa, setShowIshikawa] = useState(false);
  const [showEscape, setShowEscape] = useState(true);

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D4 — Root Cause Analysis</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Identify and verify root cause(s) using AI analysis, 5-Why, and Ishikawa methods.
      </p>

      {/* AI Analysis Button */}
      <Button
        className="bg-accent-500 hover:bg-accent-600 text-white mb-6"
        onClick={onAnalyze}
        disabled={analyzing}
      >
        {analyzing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Brain className="w-4 h-4 mr-2" />
        )}
        {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
      </Button>

      {/* Root Causes */}
      {investigation.root_causes && investigation.root_causes.length > 0 ? (
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Root Causes Identified
          </p>
          {investigation.root_causes.map((rc, i) => (
            <div
              key={i}
              className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-accent-500">#{i + 1}</span>
                <span className="text-sm font-semibold text-white flex-1">{rc.cause}</span>
                <Badge variant="accent" className="text-xs">
                  {Math.round(rc.confidence * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{rc.explanation}</p>
              {rc.evidence && rc.evidence.length > 0 && (
                <div className="mt-2 space-y-1">
                  {rc.evidence.map((ev, j) => (
                    <p key={j} className="text-xs text-[#64748B] flex items-center gap-1">
                      <span className="text-accent-500">•</span> {ev}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748B] italic mb-6">
          No root cause analysis yet. Click &quot;Run AI Analysis&quot; to start.
        </p>
      )}

      {/* 5-Why Chain */}
      {investigation.five_why_chain && investigation.five_why_chain.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            5-Why Chain
          </p>
          <div className="space-y-2">
            {investigation.five_why_chain.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-16">
                  <span className="text-xs font-mono text-accent-500 bg-accent-500/10 rounded px-1.5 py-0.5">
                    Why {i + 1}
                  </span>
                </div>
                <div className="flex-1 text-sm">
                  {item.why && <p className="text-white font-medium">{item.why}</p>}
                  {item.answer && <p className="text-[#94A3B8]">{item.answer}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ishikawa / Fishbone */}
      {investigation.fishbone_data && Object.keys(investigation.fishbone_data).length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowIshikawa(!showIshikawa)}
            className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors mb-3"
          >
            {showIshikawa ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-semibold">Ishikawa Diagram (6M)</span>
          </button>
          {showIshikawa && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(investigation.fishbone_data).map(([category, items]) => (
                <div
                  key={category}
                  className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-3"
                >
                  <p className="text-xs font-semibold text-accent-500 uppercase mb-2">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {(items as string[]).map((item, i) => (
                      <p key={i} className="text-[11px] text-[#94A3B8]">• {item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Escape Point */}
      {investigation.escape_point && (
        <div>
          <button
            onClick={() => setShowEscape(!showEscape)}
            className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors mb-3"
          >
            {showEscape ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-semibold">Escape Point</span>
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          </button>
          {showEscape && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {investigation.escape_point}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── D5: Corrective Actions ──────────────────────────────────────────────────

function D5CorrectiveActions({
  actions,
  onAddAction,
}: {
  actions: InvestigationAction[];
  onAddAction: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D5 — Corrective Actions</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Define and implement permanent corrective actions to eliminate root cause(s).
      </p>

      <ActionList actions={actions} emptyText="No corrective actions defined yet." />

      <Button
        variant="ghost"
        className="text-accent-500 hover:text-accent-400 mt-4"
        onClick={onAddAction}
      >
        <PenLine className="w-4 h-4 mr-2" />
        Add Corrective Action
      </Button>
    </div>
  );
}

// ─── D6: Verification ────────────────────────────────────────────────────────

function D6Verification({ actions }: { actions: InvestigationAction[] }) {
  // D6 verification is tied to D5 actions — show corrective actions with verification status
  const d5Actions = actions.filter((a) => a.discipline === 'D5');

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D6 — Validate Corrections</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Verify that corrective actions effectively resolve the problem and don&apos;t introduce new issues.
      </p>

      {d5Actions.length > 0 ? (
        <div className="space-y-3">
          {d5Actions.map((action) => (
            <div
              key={action.id}
              className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-white font-medium flex-1">{action.description}</p>
                <Badge
                  variant={
                    action.status === 'complete' ? 'success' : action.status === 'in_progress' ? 'warning' : 'default'
                  }
                  className="text-[10px] ml-2"
                >
                  {action.status.replace('_', ' ')}
                </Badge>
              </div>

              {action.verification_method && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-[#64748B]">
                    <span className="font-medium">Method:</span> {action.verification_method}
                  </p>
                  {action.sample_size && (
                    <p className="text-xs text-[#64748B]">
                      <span className="font-medium">Sample size:</span> {action.sample_size}
                    </p>
                  )}
                  {action.acceptance_criteria && (
                    <p className="text-xs text-[#64748B]">
                      <span className="font-medium">Criteria:</span> {action.acceptance_criteria}
                    </p>
                  )}
                  {action.verification_results && (
                    <p className="text-xs text-success">
                      <span className="font-medium">Results:</span> {action.verification_results}
                    </p>
                  )}
                </div>
              )}

              {!action.verification_method && (
                <p className="text-xs text-[#64748B] italic mt-2">
                  Verification method not yet defined for this action.
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748B] italic">
          No corrective actions to verify yet. Define corrective actions in D5 first.
        </p>
      )}
    </div>
  );
}

// ─── D7: Preventive Actions ──────────────────────────────────────────────────

function D7PreventiveActions({
  actions,
  onAddAction,
}: {
  actions: InvestigationAction[];
  onAddAction: () => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D7 — Prevent Recurrence</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Update systems and processes to prevent recurrence. PFMEA updates, procedure changes, training.
      </p>

      <ActionList actions={actions} emptyText="No preventive actions defined yet." />

      <Button
        variant="ghost"
        className="text-accent-500 hover:text-accent-400 mt-4"
        onClick={onAddAction}
      >
        <PenLine className="w-4 h-4 mr-2" />
        Add Preventive Action
      </Button>
    </div>
  );
}

// ─── D8: Closure ─────────────────────────────────────────────────────────────

function D8Closure({ investigation }: { investigation: Investigation }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">D8 — Closure & Recognition</h3>
      <p className="text-sm text-[#64748B] mb-6">
        Close the investigation, recognize the team, and document lessons learned.
      </p>

      {investigation.closure_summary ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#64748B] font-medium mb-1">Closure Summary</p>
            <p className="text-sm text-[#94A3B8] leading-relaxed">{investigation.closure_summary}</p>
          </div>
          {investigation.lessons_learned && (
            <div>
              <p className="text-xs text-[#64748B] font-medium mb-1">Lessons Learned</p>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{investigation.lessons_learned}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#0A1628] rounded-lg border border-[#1F2937] p-4">
            <p className="text-sm text-[#94A3B8] mb-4">
              Complete all disciplines and verification before closing.
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-white text-xs">Lessons Learned</Label>
                <Textarea
                  placeholder="What did the team learn? What would you do differently?"
                  rows={3}
                  className="mt-1 bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B] text-sm"
                />
              </div>
              <div>
                <Label className="text-white text-xs">Closure Summary</Label>
                <Textarea
                  placeholder="Summary of the investigation and resolution..."
                  rows={3}
                  className="mt-1 bg-brand-800 border-[#1F2937] text-white placeholder:text-[#64748B] text-sm"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-[#64748B] italic">
            This investigation has not yet been closed.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Action List ────────────────────────────────────────────────────

function ActionList({
  actions,
  emptyText,
}: {
  actions: InvestigationAction[];
  emptyText: string;
}) {
  if (actions.length === 0) {
    return <p className="text-sm text-[#64748B] italic">{emptyText}</p>;
  }

  const now = Date.now();

  return (
    <div className="space-y-3">
      {actions.map((action) => {
        const isOverdue =
          action.status !== 'complete' &&
          action.due_date &&
          new Date(action.due_date).getTime() < now;

        return (
          <div
            key={action.id}
            className={`bg-[#0A1628] rounded-lg border p-4 ${
              isOverdue ? 'border-danger/30' : 'border-[#1F2937]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                  action.status === 'complete'
                    ? 'bg-success'
                    : action.status === 'in_progress'
                    ? 'bg-warning'
                    : 'bg-[#374151]'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-relaxed">{action.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    variant={
                      action.status === 'complete'
                        ? 'success'
                        : action.status === 'in_progress'
                        ? 'warning'
                        : 'default'
                    }
                    className="text-[10px]"
                  >
                    {action.status.replace('_', ' ')}
                  </Badge>
                  {action.priority && (
                    <Badge
                      variant={
                        action.priority === 'P1' ? 'danger' : action.priority === 'P2' ? 'warning' : 'default'
                      }
                      className="text-[10px]"
                    >
                      {action.priority}
                    </Badge>
                  )}
                  {action.owner_user_id && (
                    <span className="text-[10px] text-[#64748B]">
                      {getTeamMemberName(action.owner_user_id)}
                    </span>
                  )}
                  {action.due_date && (
                    <span
                      className={`text-[10px] ${
                        isOverdue ? 'text-danger font-semibold' : 'text-[#64748B]'
                      }`}
                    >
                      {isOverdue && '⚠ '}Due: {action.due_date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
