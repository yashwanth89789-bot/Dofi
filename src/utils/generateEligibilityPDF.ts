/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { DonorEligibilityScreeningResult } from '../types';

/**
 * Builds a clean, professional A4 PDF for AI-assisted donor eligibility screening
 * with robust multi-page support, consent verification status, and medical safety notices.
 */
export function createEligibilityPDF(
  result: DonorEligibilityScreeningResult,
  candidateName: string,
  bloodGroup: string
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  const printPageHeader = (isContinuation: boolean = false) => {
    // Header Accent Bar
    doc.setFillColor(13, 148, 136); // #0d9488 (Teal-600)
    doc.rect(margin, y, contentWidth, 2.5, 'F');
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text('DOFI', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('Blood Donation Coordination Platform', margin + 20, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    const subTitle = isContinuation
      ? 'AI-ASSISTED DONOR SCREENING REPORT (CONTINUED)'
      : 'AI-ASSISTED PRE-DONATION SCREENING ASSESSMENT';
    doc.text(subTitle, margin, y);
    y += 6;
  };

  // --- Initial Page Header ---
  printPageHeader(false);

  // --- Meta Information Grid (Card Box) ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  const metaColWidth = contentWidth / 4;
  const metaY = y + 5;

  // Candidate
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CANDIDATE', margin + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(candidateName || 'Anonymous Candidate', margin + 4, metaY + 6);

  // Blood Group
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BLOOD GROUP', margin + metaColWidth + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(bloodGroup || 'Not Specified', margin + metaColWidth + 4, metaY + 6);

  // Report ID
  const reportId = result.reportId || `DF-SCR-${Date.now().toString().slice(-6)}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('REPORT ID', margin + metaColWidth * 2 + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(reportId, margin + metaColWidth * 2 + 4, metaY + 6);

  // Date Generated
  const dateStr = result.generatedAt || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GENERATED', margin + metaColWidth * 3 + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, margin + metaColWidth * 3 + 4, metaY + 6);

  y += 22;

  // --- Consent & Acknowledgement Status Strip ---
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.setDrawColor(204, 251, 241); // Teal-100
  doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 148, 136);
  doc.text('CONSENT & ACKNOWLEDGEMENT:', margin + 4, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Preliminary Screening Acknowledged [✓]  •  Personal Data Processing Consented [✓]', margin + 55, y + 5.5);

  y += 13;

  // --- Overall Status Badge Box ---
  let statusBg = [236, 253, 245]; // Emerald-50
  let statusBorder = [167, 243, 208]; // Emerald-200
  let statusText = [6, 95, 70]; // Emerald-800
  let statusTitle = result.statusLabel || 'PRELIMINARY SCREENING: NO IMMEDIATE FLAG';

  if (result.status === 'temporarily_deferred') {
    statusBg = [254, 243, 199]; // Amber-50
    statusBorder = [253, 230, 138]; // Amber-200
    statusText = [146, 64, 14]; // Amber-800
    statusTitle = result.statusLabel || 'PRELIMINARY SCREENING: POTENTIAL TEMPORARY DEFERRAL';
  } else if (result.status === 'needs_manual_review') {
    statusBg = [238, 242, 255]; // Indigo-50
    statusBorder = [199, 210, 254]; // Indigo-200
    statusText = [55, 48, 163]; // Indigo-800
    statusTitle = result.statusLabel || 'PRELIMINARY SCREENING: NEEDS MANUAL REVIEW';
  }

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.setDrawColor(statusBorder[0], statusBorder[1], statusBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(statusText[0], statusText[1], statusText[2]);
  doc.text('OVERALL PRELIMINARY ASSESSMENT STATUS', margin + 4, y + 4.5);

  doc.setFontSize(10);
  doc.text(statusTitle.toUpperCase(), margin + 4, y + 9.5);

  y += 17;

  // --- Screening Parameters Table Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EVALUATED SCREENING PARAMETERS', margin, y);
  y += 4.5;

  const printTableHeader = () => {
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('PARAMETER', margin + 3, y + 4.5);
    doc.text('ENTERED VALUE', margin + 46, y + 4.5);
    doc.text('STATUS', margin + 82, y + 4.5);
    doc.text('CLINICAL ASSESSMENT & RATIONALE', margin + 106, y + 4.5);
    y += 6.5;
  };

  printTableHeader();

  // Table Body Rows
  (result.parameters || []).forEach((param, idx) => {
    const isEven = idx % 2 === 0;
    const splitReason = doc.splitTextToSize(param.reason || '', contentWidth - 110);
    const lineCount = Math.max(1, splitReason.length);
    const rowHeight = Math.max(8.5, 5 + lineCount * 3.5);

    // Check if row exceeds printable height (leaving space for footer)
    if (y + rowHeight > 260) {
      doc.addPage();
      y = 16;
      printPageHeader(true);
      printTableHeader();
    }

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Horizontal divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // Param name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(param.name, margin + 3, y + 5);

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(String(param.value), margin + 46, y + 5);

    // Status pill text
    const statusUpper = (param.status || 'review').toUpperCase();
    if (param.status === 'pass') {
      doc.setTextColor(5, 150, 105); // Emerald-600
    } else if (param.status === 'flag') {
      doc.setTextColor(225, 29, 72); // Rose-600
    } else {
      doc.setTextColor(217, 119, 6); // Amber-600
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`[ ${statusUpper} ]`, margin + 82, y + 5);

    // Reason
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(splitReason, margin + 106, y + 4.5);

    y += rowHeight;
  });

  y += 5;

  // --- AI Screening Summary & Recommendations ---
  const summaryBoxHeight = 22;
  if (y + summaryBoxHeight > 255) {
    doc.addPage();
    y = 16;
    printPageHeader(true);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('AI PRE-SCREENING SUMMARY & NEXT STEPS', margin, y);
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, summaryBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(result.summary || 'Preliminary parameters analyzed successfully.', contentWidth - 8);
  doc.text(splitSummary, margin + 4, y + 5);

  if (result.recommendation) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136);
    doc.text('Recommendation:', margin + 4, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitRec = doc.splitTextToSize(result.recommendation, contentWidth - 36);
    doc.text(splitRec, margin + 30, y + 14);
  }

  y += summaryBoxHeight + 5;

  // --- Medical Safety Disclaimer (Notice Box) ---
  const disclaimerBoxHeight = 21;
  if (y + disclaimerBoxHeight > 265) {
    doc.addPage();
    y = 16;
    printPageHeader(true);
  }

  doc.setFillColor(254, 242, 242); // Rose-50
  doc.setDrawColor(254, 202, 202); // Rose-200
  doc.roundedRect(margin, y, contentWidth, disclaimerBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57); // Rose-900
  doc.text('MANDATORY CLINICAL SAFETY NOTICE', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(159, 18, 57);
  const noticeLines = [
    '• Preliminary screening support only. This report does NOT constitute medical clearance or approval to donate blood.',
    '• Final donor eligibility must be determined by qualified blood-centre/blood-bank personnel after on-site examination.',
    '• On-site clinical evaluation, hemoglobin verification, and certified serological testing are required before collection.'
  ];
  noticeLines.forEach((line, idx) => {
    doc.text(line, margin + 4, y + 8.5 + idx * 3.8);
  });

  // --- Document Footers across all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = 286;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text('Dofi — Blood Donation Coordination Platform | Authenticated Donor Session', margin, footerY);
    doc.text(`Page ${i} of ${totalPages}  •  Ref: ${reportId}`, pageWidth - margin - 35, footerY);
  }

  return doc;
}

/**
 * Generates and triggers browser download of the PDF report.
 */
export function downloadEligibilityPDF(
  result: DonorEligibilityScreeningResult,
  candidateName: string,
  bloodGroup: string
): void {
  const doc = createEligibilityPDF(result, candidateName, bloodGroup);
  const safeName = (candidateName || 'Donor').replace(/[^a-zA-Z0-9_-]/g, '_');
  const reportId = result.reportId || Date.now().toString();
  doc.save(`Dofi_Eligibility_Report_${safeName}_${reportId.slice(-6)}.pdf`);
}
