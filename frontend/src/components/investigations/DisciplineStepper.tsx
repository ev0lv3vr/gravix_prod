'use client';

import { useState } from 'react';
import type { Investigation, InvestigationAction, InvestigationSignature } from '@/lib/investigations';
import { DISCIPLINES } from './InvestigationHelpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronDown, ChevronRight, Brain, PenLine, Loader2 } from 'lucide-react';

interface DisciplineStepperProps {
  investigation: Investigation;
  actions: InvestigationAction[];
  signatures: InvestigationSignature[];
  onAnalyze: () => Promise<void>;
  onSign: (discipline: string) => Promise<void>;
  onAddAction: (discipline: string) => void;
  analyzing: boolean;
  signing: string | null;
}

export function DisciplineStepper({
  investigation,
  actions,
  signatures,
  onAnalyze,
  onSign,
  onAddAction,
  analyzing,
  signing,
}: DisciplineStepperProps) {
  const [expanded, setExpanded] = useState<string>('D1');

  const isSigned = (discipline: string) =>
    signatures.some((s) => s.discipline === discipline);

  const getActionsFor = (discipline: string) =>
    actions.filter((a) => a.discipline === discipline);

  const toggle = (key: string) => {
    setExpanded((prev) => (prev === key ? '' : key));
  };

  return (
    <div className="space-y-2">
      {DISCIPLINES.map(({ key, title, description }) => {
        const signed = isSigned(key);
        const isOpen = expanded === key;
        const disciplineActions = getActionsFor(key);

        return (
          <div key={key} className="bg-brand-800 border border-[#1F2937] rounded-lg overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1F2937]/50 transition-colors"
            >
              {signed ? (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-[#374151] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{title}</span>
                  {signed && <Badge variant="success" className="text-[10px] py-0">Signed</Badge>}
                </div>
                <p className="text-xs text-[#64748B] truncate">{description}</p>
              </div>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              )}
            </button>

            {/* Content */}
            {isOpen && (
              <div className="px-4 pb-4 border-t border-[#1F2937]">
                <div className="pt-4 space-y-4">
                  {/* D1 — Team */}
                  {key === 'D1' && (
                    <div className="text-sm text-[#94A3B8] space-y-2">
                      <p>
                        <span className="text-[#64748B]">Team Lead:</span>{' '}
                        {investigation.team_lead_user_id ? `User ${investigation.team_lead_user_id.slice(0, 8)}...` : '—'}
                      </p>
                      <p>
                        <span className="text-[#64748B]">Champion:</span>{' '}
                        {investigation.champion_user_id ? `User ${investigation.champion_user_id.slice(0, 8)}...` : 'Not assigned'}
                      </p>
                      <p>
                        <span className="text-[#64748B]">Approver:</span>{' '}
                        {investigation.approver_user_id ? `User ${investigation.approver_user_id.slice(0, 8)}...` : 'Not assigned'}
                      </p>
                    </div>
                  )}

                  {/* D2 — Problem Description */}
                  {key === 'D2' && (
                    <div className="text-sm text-[#94A3B8] space-y-2">
                      {investigation.what_failed && (
                        <p><span className="text-[#64748B]">What failed:</span> {investigation.what_failed}</p>
                      )}
                      {investigation.who_reported && (
                        <p><span className="text-[#64748B]">Who reported:</span> {investigation.who_reported}</p>
                      )}
                      {investigation.where_in_process && (
                        <p><span className="text-[#64748B]">Where:</span> {investigation.where_in_process}</p>
                      )}
                      {investigation.how_detected && (
                        <p><span className="text-[#64748B]">How detected:</span> {investigation.how_detected}</p>
                      )}
                      {investigation.how_many_affected != null && (
                        <p><span className="text-[#64748B]">How many affected:</span> {investigation.how_many_affected}</p>
                      )}
                      {investigation.why_it_matters && (
                        <p><span className="text-[#64748B]">Why it matters:</span> {investigation.why_it_matters}</p>
                      )}
                      {!investigation.what_failed && !investigation.who_reported && (
                        <p className="text-[#64748B] italic">No problem description entered yet.</p>
                      )}
                    </div>
                  )}

                  {/* D3 — Containment actions */}
                  {key === 'D3' && (
                    <ActionList
                      actions={disciplineActions}
                      emptyText="No containment actions defined yet."
                    />
                  )}

                  {/* D4 — Root Cause */}
                  {key === 'D4' && (
                    <div className="space-y-3">
                      {investigation.root_causes && investigation.root_causes.length > 0 ? (
                        <div className="space-y-2">
                          {investigation.root_causes.map((rc, i) => (
                            <div key={i} className="bg-[#0A1628] rounded p-3 border border-[#1F2937]">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-accent-500">#{i + 1}</span>
                                <span className="text-sm font-medium text-white">{rc.cause}</span>
                                <Badge variant="accent" className="text-[10px] py-0 ml-auto">
                                  {Math.round(rc.confidence * 100)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-[#94A3B8]">{rc.explanation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#64748B] italic">No root cause analysis yet.</p>
                      )}

                      {investigation.five_why_chain && investigation.five_why_chain.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-[#64748B] uppercase mb-2">5-Why Chain</p>
                          <div className="space-y-1">
                            {investigation.five_why_chain.map((item, i) => (
                              <div key={i} className="text-xs text-[#94A3B8]">
                                <span className="text-accent-500 font-mono">Why {i + 1}:</span> {item.why || item.answer}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {investigation.escape_point && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-[#64748B] uppercase mb-1">Escape Point</p>
                          <p className="text-sm text-[#94A3B8]">{investigation.escape_point}</p>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-accent-500 hover:text-accent-400"
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
                    </div>
                  )}

                  {/* D5 — Corrective Actions */}
                  {key === 'D5' && (
                    <ActionList
                      actions={disciplineActions}
                      emptyText="No corrective actions defined yet."
                    />
                  )}

                  {/* D6 — Validation */}
                  {key === 'D6' && (
                    <div className="text-sm text-[#94A3B8]">
                      {disciplineActions.length > 0 ? (
                        <ActionList actions={disciplineActions} emptyText="" />
                      ) : (
                        <p className="text-[#64748B] italic">
                          Verification activities are tracked through D5 corrective action verification fields.
                        </p>
                      )}
                    </div>
                  )}

                  {/* D7 — Prevention */}
                  {key === 'D7' && (
                    <ActionList
                      actions={disciplineActions}
                      emptyText="No preventive actions defined yet."
                    />
                  )}

                  {/* D8 — Closure */}
                  {key === 'D8' && (
                    <div className="text-sm text-[#94A3B8] space-y-2">
                      {investigation.closure_summary && (
                        <p><span className="text-[#64748B]">Closure Summary:</span> {investigation.closure_summary}</p>
                      )}
                      {investigation.lessons_learned && (
                        <p><span className="text-[#64748B]">Lessons Learned:</span> {investigation.lessons_learned}</p>
                      )}
                      {!investigation.closure_summary && !investigation.lessons_learned && (
                        <p className="text-[#64748B] italic">Investigation not yet closed.</p>
                      )}
                    </div>
                  )}

                  {/* Add Action button for D3, D5, D7 */}
                  {['D3', 'D5', 'D7'].includes(key) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-accent-500 hover:text-accent-400"
                      onClick={() => onAddAction(key)}
                    >
                      <PenLine className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  )}

                  {/* Sign-off */}
                  {!signed && (
                    <div className="pt-2 border-t border-[#1F2937]">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-success hover:text-success/80"
                        onClick={() => onSign(key)}
                        disabled={signing === key}
                      >
                        {signing === key ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Sign Off {key}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActionList({ actions, emptyText }: { actions: InvestigationAction[]; emptyText: string }) {
  if (actions.length === 0 && emptyText) {
    return <p className="text-sm text-[#64748B] italic">{emptyText}</p>;
  }
  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <div key={action.id} className="flex items-start gap-3 bg-[#0A1628] rounded p-3 border border-[#1F2937]">
          <div
            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              action.status === 'complete'
                ? 'bg-success'
                : action.status === 'in_progress'
                ? 'bg-warning'
                : 'bg-[#374151]'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">{action.description}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[#64748B]">{action.status.replace('_', ' ')}</span>
              {action.priority && (
                <Badge
                  variant={action.priority === 'P1' ? 'danger' : action.priority === 'P2' ? 'warning' : 'default'}
                  className="text-[10px] py-0"
                >
                  {action.priority}
                </Badge>
              )}
              {action.due_date && (
                <span className="text-xs text-[#64748B]">Due: {action.due_date}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
