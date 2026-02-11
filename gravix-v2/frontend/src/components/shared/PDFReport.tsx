'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { v4 as uuidv4 } from 'uuid';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#1F2937',
    position: 'relative',
  },
  header: {
    marginBottom: 24,
    borderBottom: 3,
    borderBottomColor: '#3B82F6',
    paddingBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0A1628',
    letterSpacing: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#374151',
    marginTop: 4,
  },
  reportMeta: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0A1628',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 6,
    marginTop: 8,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 6,
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: 2,
    borderBottomColor: '#3B82F6',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
    color: '#0A1628',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 12,
  },
  bullet: {
    width: 12,
    fontSize: 10,
    color: '#3B82F6',
  },
  listText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  numberedBullet: {
    width: 16,
    fontSize: 10,
    fontWeight: 700,
    color: '#3B82F6',
  },
  confidenceBadge: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    padding: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    border: 1,
    borderColor: '#F59E0B',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
  },
  warningText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4,
  },
  methodology: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  methodologyText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    fontWeight: 700,
    color: '#E5E7EB',
    opacity: 0.15,
    width: 800,
    textAlign: 'center',
  },
  blurredSection: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  blurredText: {
    fontSize: 10,
    color: '#D1D5DB',
    lineHeight: 1.6,
  },
});

export interface SpecPDFData {
  type: 'spec';
  inputs: {
    substrateA: string;
    substrateB: string;
    loadType: string;
    tempRange: string;
    environment: string[];
    cureConstraint?: string;
    additionalContext?: string;
  };
  recommendedSpec: {
    materialType: string;
    chemistry: string;
    rationale: string;
  };
  productCharacteristics: Record<string, string>;
  applicationGuidance: {
    surfacePreparation: string[];
    applicationTips: string[];
    curingNotes: string[];
    commonMistakesToAvoid: string[];
  };
  warnings: string[];
  alternatives: Array<{
    materialType: string;
    chemistry: string;
    advantages: string[];
    disadvantages: string[];
  }>;
  confidenceScore: number;
  executiveSummary?: string;
}

export interface FailurePDFData {
  type: 'failure';
  inputs: {
    failureMode: string;
    adhesiveUsed?: string;
    substrateA?: string;
    substrateB?: string;
    environmentConditions: string[];
    timeToFailure?: string;
    surfacePrep: string[];
    failureDescription: string;
  };
  diagnosis: {
    topRootCause: string;
    explanation: string;
  };
  rootCauses: Array<{
    rank: number;
    cause: string;
    confidence: number;
    explanation: string;
    mechanism: string;
  }>;
  contributingFactors: string[];
  immediateActions: string[];
  longTermSolutions: string[];
  preventionPlan: string[];
  confidenceScore: number;
  executiveSummary?: string;
}

interface PDFReportProps {
  data: SpecPDFData | FailurePDFData;
  isFree: boolean;
}

export function PDFReport({ data, isFree }: PDFReportProps) {
  const reportId = uuidv4().split('-')[0].toUpperCase();
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isSpec = data.type === 'spec';
  const reportTitle = isSpec
    ? 'Adhesive Specification Report'
    : 'Failure Analysis Report';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark for free tier */}
        {isFree && (
          <View style={styles.watermark} fixed>
            <Text>FREE TIER — UPGRADE FOR FULL REPORT</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.logo}>GRAVIX</Text>
          <Text style={styles.reportTitle}>{reportTitle}</Text>
          <View style={styles.reportMeta}>
            <Text>Report ID: {reportId}</Text>
            <Text>{reportDate}</Text>
          </View>
        </View>

        {/* Executive Summary - Only for Pro tier */}
        {!isFree && data.executiveSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.paragraph}>{data.executiveSummary}</Text>
          </View>
        )}

        {/* Blurred placeholder for free tier */}
        {isFree && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.blurredSection}>
              <Text style={styles.blurredText}>
                [Executive Summary available in Pro tier]
              </Text>
              <Text style={styles.blurredText}>
                Upgrade to access detailed executive summaries with risk
                analysis, decision frameworks, and strategic recommendations.
              </Text>
            </View>
          </View>
        )}

        {/* Input Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Parameters</Text>
          <View style={styles.table}>
            {Object.entries(isSpec ? (data as SpecPDFData).inputs : (data as FailurePDFData).inputs).map(
              ([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                const displayValue = Array.isArray(value) ? value.join(', ') : value;
                return (
                  <View style={styles.tableRow} key={key}>
                    <Text style={[styles.tableCell, { fontWeight: 700 }]}>
                      {label}:
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {displayValue}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>

        {/* Spec-specific content */}
        {isSpec && <SpecContent data={data as SpecPDFData} />}

        {/* Failure-specific content */}
        {!isSpec && <FailureContent data={data as FailurePDFData} />}

        {/* Methodology Note */}
        <View style={styles.methodology}>
          <Text style={styles.methodologyText}>
            This analysis was generated by Gravix AI engine. Recommendations
            should be validated through testing appropriate to your application.
            Gravix provides guidance based on material science principles and
            industry best practices, but does not guarantee specific performance
            outcomes for your unique application.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Gravix.com | GLUE MASTERS LLC
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function SpecContent({ data }: { data: SpecPDFData }) {
  return (
    <>
      {/* Primary Result */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Specification</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 700 }]}>
              Material Type:
            </Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {data.recommendedSpec.materialType}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { fontWeight: 700 }]}>
              Chemistry:
            </Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {data.recommendedSpec.chemistry}
            </Text>
          </View>
        </View>
        <Text style={[styles.paragraph, { marginTop: 8 }]}>
          {data.recommendedSpec.rationale}
        </Text>
      </View>

      {/* Product Characteristics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Characteristics</Text>
        <View style={styles.table}>
          {Object.entries(data.productCharacteristics).map(([key, value]) => {
            if (!value) return null;
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());
            return (
              <View style={styles.tableRow} key={key}>
                <Text style={[styles.tableCell, { fontWeight: 700 }]}>
                  {label}:
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{value}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Risk Factors */}
      {data.warnings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Factors</Text>
          {data.warnings.map((warning, i) => (
            <View style={styles.warningBox} key={i}>
              <Text style={styles.warningText}>⚠ {warning}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Application Guidance */}
      <View style={styles.section} break>
        <Text style={styles.sectionTitle}>Application Guidance</Text>

        {data.applicationGuidance.surfacePreparation.length > 0 && (
          <View>
            <Text style={styles.subsectionTitle}>Surface Preparation</Text>
            {data.applicationGuidance.surfacePreparation.map((step, i) => (
              <View style={styles.listItem} key={i}>
                <Text style={styles.numberedBullet}>{i + 1}.</Text>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {data.applicationGuidance.applicationTips.length > 0 && (
          <View>
            <Text style={styles.subsectionTitle}>Application Tips</Text>
            {data.applicationGuidance.applicationTips.map((tip, i) => (
              <View style={styles.listItem} key={i}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {data.applicationGuidance.curingNotes.length > 0 && (
          <View>
            <Text style={styles.subsectionTitle}>Curing Notes</Text>
            {data.applicationGuidance.curingNotes.map((note, i) => (
              <View style={styles.listItem} key={i}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        {data.applicationGuidance.commonMistakesToAvoid.length > 0 && (
          <View>
            <Text style={styles.subsectionTitle}>Common Mistakes to Avoid</Text>
            {data.applicationGuidance.commonMistakesToAvoid.map((mistake, i) => (
              <View style={styles.listItem} key={i}>
                <Text style={[styles.bullet, { color: '#EF4444' }]}>✗</Text>
                <Text style={styles.listText}>{mistake}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Alternatives */}
      {data.alternatives.length > 0 && (
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Alternative Specifications</Text>
          {data.alternatives.map((alt, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <Text style={styles.subsectionTitle}>
                {i + 1}. {alt.chemistry}
              </Text>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.paragraph, { fontWeight: 700, color: '#10B981' }]}>
                  Advantages:
                </Text>
                {alt.advantages.map((adv, j) => (
                  <View style={styles.listItem} key={j}>
                    <Text style={[styles.bullet, { color: '#10B981' }]}>+</Text>
                    <Text style={styles.listText}>{adv}</Text>
                  </View>
                ))}
                <Text style={[styles.paragraph, { fontWeight: 700, color: '#EF4444', marginTop: 6 }]}>
                  Disadvantages:
                </Text>
                {alt.disadvantages.map((dis, j) => (
                  <View style={styles.listItem} key={j}>
                    <Text style={[styles.bullet, { color: '#EF4444' }]}>−</Text>
                    <Text style={styles.listText}>{dis}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function FailureContent({ data }: { data: FailurePDFData }) {
  return (
    <>
      {/* Primary Diagnosis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Diagnosis</Text>
        <Text style={[styles.paragraph, { fontWeight: 700, fontSize: 12, color: '#0A1628' }]}>
          {data.diagnosis.topRootCause}
        </Text>
        <Text style={styles.paragraph}>{data.diagnosis.explanation}</Text>
      </View>

      {/* Root Cause Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Root Cause Analysis</Text>
        {data.rootCauses.map((cause) => (
          <View key={cause.rank} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.subsectionTitle, { marginBottom: 0 }]}>
                #{cause.rank} {cause.cause}
              </Text>
              <Text style={{ fontSize: 9, color: '#6366F1', marginLeft: 8 }}>
                {Math.round(cause.confidence * 100)}% confidence
              </Text>
            </View>
            <Text style={styles.paragraph}>{cause.explanation}</Text>
            <View style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 4, marginTop: 4 }}>
              <Text style={[styles.paragraph, { fontSize: 9, color: '#6B7280', marginBottom: 0 }]}>
                {cause.mechanism}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Contributing Factors */}
      {data.contributingFactors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contributing Factors</Text>
          {data.contributingFactors.map((factor, i) => (
            <View style={styles.listItem} key={i}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.listText}>{factor}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Immediate Actions */}
      {data.immediateActions.length > 0 && (
        <View style={styles.section} break>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
            🚨 Immediate Actions
          </Text>
          {data.immediateActions.map((action, i) => (
            <View style={styles.listItem} key={i}>
              <Text style={[styles.numberedBullet, { color: '#EF4444' }]}>
                {i + 1}.
              </Text>
              <Text style={styles.listText}>{action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Long-term Solutions */}
      {data.longTermSolutions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#6366F1' }]}>
            🔧 Long-term Solutions
          </Text>
          {data.longTermSolutions.map((solution, i) => (
            <View style={styles.listItem} key={i}>
              <Text style={[styles.bullet, { color: '#6366F1' }]}>•</Text>
              <Text style={styles.listText}>{solution}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Prevention Plan */}
      {data.preventionPlan.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prevention Plan</Text>
          {data.preventionPlan.map((step, i) => (
            <View style={styles.listItem} key={i}>
              <Text style={styles.bullet}>☐</Text>
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}
