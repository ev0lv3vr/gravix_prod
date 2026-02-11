import { pdf } from '@react-pdf/renderer';
import { PDFReport, SpecPDFData, FailurePDFData } from '@/components/shared/PDFReport';

export async function generateAndDownloadPDF(
  data: SpecPDFData | FailurePDFData,
  isFree: boolean
): Promise<void> {
  try {
    // Generate PDF blob
    const blob = await pdf(<PDFReport data={data} isFree={isFree} />).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename =
      data.type === 'spec'
        ? `gravix-spec-report-${date}.pdf`
        : `gravix-failure-report-${date}.pdf`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
}

export function generateExecutiveSummary(
  data: SpecPDFData | FailurePDFData
): string {
  if (data.type === 'spec') {
    const specData = data as SpecPDFData;
    return `Based on the analysis of bonding ${specData.inputs.substrateA} to ${specData.inputs.substrateB} under specified conditions, we recommend ${specData.recommendedSpec.chemistry}. This recommendation is based on substrate compatibility, environmental requirements (${specData.inputs.tempRange}), and application constraints. The confidence level for this specification is ${Math.round(specData.confidenceScore * 100)}%. ${specData.warnings.length > 0 ? `Key risk factors have been identified and should be reviewed carefully before implementation.` : 'No critical risk factors were identified.'} Alternative specifications are provided for consideration based on specific application priorities.`;
  } else {
    const failureData = data as FailurePDFData;
    return `The failure analysis indicates that ${failureData.diagnosis.topRootCause.toLowerCase()} is the primary root cause with ${Math.round(failureData.diagnosis.explanation ? failureData.rootCauses[0]?.confidence * 100 : 0)}% confidence. ${failureData.contributingFactors.length > 0 ? `${failureData.contributingFactors.length} contributing factors have been identified.` : ''} Immediate corrective actions are recommended to prevent recurrence. Long-term solutions focus on process improvements and preventive measures. This analysis is based on the failure mode pattern, environmental conditions, and material properties reported.`;
  }
}
