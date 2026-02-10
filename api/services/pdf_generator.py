"""
PDF report generation service using ReportLab.
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
from typing import Dict, Any, List


class PDFGenerator:
    """Service for generating professional PDF reports."""
    
    @staticmethod
    def generate_failure_analysis_report(analysis: Dict[str, Any]) -> BytesIO:
        """
        Generate PDF report for failure analysis.
        
        Args:
            analysis: Complete failure analysis data
            
        Returns:
            BytesIO buffer containing PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            spaceBefore=20
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubheading',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=10,
            spaceBefore=15
        )
        
        normal_style = styles['Normal']
        normal_style.fontSize = 10
        normal_style.leading = 14
        
        # Header
        story.append(Paragraph("GRAVIX", title_style))
        story.append(Paragraph("Failure Analysis Report", heading_style))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Material Information Section
        story.append(Paragraph("MATERIAL INFORMATION", heading_style))
        material_data = [
            ["Category:", analysis.get('material_category', 'N/A')],
            ["Subcategory:", analysis.get('material_subcategory', 'N/A')],
            ["Product:", analysis.get('material_product', 'N/A')],
            ["Failure Mode:", analysis.get('failure_mode', 'N/A')]
        ]
        material_table = Table(material_data, colWidths=[2*inch, 4.5*inch])
        material_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(material_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Failure Description
        story.append(Paragraph("FAILURE DESCRIPTION", heading_style))
        story.append(Paragraph(analysis.get('failure_description', 'N/A'), normal_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Substrates
        story.append(Paragraph("SUBSTRATES", heading_style))
        substrate_data = [
            ["Substrate A:", analysis.get('substrate_a', 'N/A')],
            ["Substrate B:", analysis.get('substrate_b', 'N/A')]
        ]
        substrate_table = Table(substrate_data, colWidths=[2*inch, 4.5*inch])
        substrate_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(substrate_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Environmental Conditions
        story.append(Paragraph("ENVIRONMENTAL CONDITIONS", heading_style))
        env_data = [
            ["Temperature Range:", analysis.get('temperature_range', 'N/A')],
            ["Humidity:", analysis.get('humidity', 'N/A')],
            ["Chemical Exposure:", analysis.get('chemical_exposure', 'N/A')],
            ["Time to Failure:", analysis.get('time_to_failure', 'N/A')]
        ]
        env_table = Table(env_data, colWidths=[2*inch, 4.5*inch])
        env_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(env_table)
        story.append(Spacer(1, 0.3*inch))
        
        # ROOT CAUSES ANALYSIS
        story.append(Paragraph("ROOT CAUSE ANALYSIS", heading_style))
        root_causes = analysis.get('root_causes', [])
        
        for i, cause in enumerate(root_causes, 1):
            confidence = cause.get('confidence', 0) * 100
            story.append(Paragraph(f"<b>Root Cause #{i} - {cause.get('cause', 'Unknown')} (Confidence: {confidence:.0f}%)</b>", subheading_style))
            story.append(Paragraph(f"<b>Category:</b> {cause.get('category', 'N/A').replace('_', ' ').title()}", normal_style))
            story.append(Spacer(1, 0.1*inch))
            story.append(Paragraph(f"<b>Explanation:</b> {cause.get('explanation', 'N/A')}", normal_style))
            
            if cause.get('evidence'):
                story.append(Spacer(1, 0.1*inch))
                story.append(Paragraph("<b>Evidence:</b>", normal_style))
                for evidence in cause.get('evidence', []):
                    story.append(Paragraph(f"• {evidence}", normal_style))
            
            story.append(Spacer(1, 0.15*inch))
        
        # Contributing Factors
        if analysis.get('contributing_factors'):
            story.append(Paragraph("CONTRIBUTING FACTORS", heading_style))
            for factor in analysis.get('contributing_factors', []):
                story.append(Paragraph(f"• {factor}", normal_style))
            story.append(Spacer(1, 0.2*inch))
        
        # RECOMMENDATIONS
        story.append(Paragraph("RECOMMENDATIONS", heading_style))
        recommendations = analysis.get('recommendations', [])
        
        for i, rec in enumerate(recommendations, 1):
            priority = rec.get('priority', 'unknown').replace('_', ' ').title()
            story.append(Paragraph(f"<b>{i}. {rec.get('title', 'Untitled')} [{priority}]</b>", subheading_style))
            story.append(Paragraph(rec.get('description', 'N/A'), normal_style))
            
            if rec.get('implementation_steps'):
                story.append(Spacer(1, 0.1*inch))
                story.append(Paragraph("<b>Implementation Steps:</b>", normal_style))
                for step in rec.get('implementation_steps', []):
                    story.append(Paragraph(f"• {step}", normal_style))
            
            story.append(Spacer(1, 0.15*inch))
        
        # Prevention Plan
        if analysis.get('prevention_plan'):
            story.append(Paragraph("PREVENTION PLAN", heading_style))
            story.append(Paragraph(analysis.get('prevention_plan', 'N/A'), normal_style))
            story.append(Spacer(1, 0.2*inch))
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        story.append(Paragraph(f"Report ID: {analysis.get('id', 'N/A')}", footer_style))
        story.append(Paragraph("Generated by Gravix AI-Powered Materials Intelligence Platform", footer_style))
        story.append(Paragraph("© 2026 Gravix. All rights reserved.", footer_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    @staticmethod
    def generate_spec_report(spec: Dict[str, Any]) -> BytesIO:
        """
        Generate PDF report for material specification.
        
        Args:
            spec: Complete spec request data
            
        Returns:
            BytesIO buffer containing PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles (same as failure report)
        title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1a1a1a'), spaceAfter=30, alignment=TA_CENTER)
        heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#2563eb'), spaceAfter=12, spaceBefore=20)
        subheading_style = ParagraphStyle('CustomSubheading', parent=styles['Heading3'], fontSize=14, textColor=colors.HexColor('#1e40af'), spaceAfter=10, spaceBefore=15)
        normal_style = styles['Normal']
        normal_style.fontSize = 10
        normal_style.leading = 14
        
        # Header
        story.append(Paragraph("GRAVIX", title_style))
        story.append(Paragraph("Material Specification", heading_style))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Application Information
        story.append(Paragraph("APPLICATION REQUIREMENTS", heading_style))
        app_data = [
            ["Material Category:", spec.get('material_category', 'N/A')],
            ["Substrate A:", spec.get('substrate_a', 'N/A')],
            ["Substrate B:", spec.get('substrate_b', 'N/A')],
            ["Production Volume:", spec.get('production_volume', 'N/A')],
            ["Application Method:", spec.get('application_method', 'N/A')]
        ]
        app_table = Table(app_data, colWidths=[2*inch, 4.5*inch])
        app_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(app_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Recommended Specification
        recommended = spec.get('recommended_spec', {})
        story.append(Paragraph("RECOMMENDED SPECIFICATION", heading_style))
        story.append(Paragraph(f"<b>Material Type:</b> {recommended.get('material_type', 'N/A')}", normal_style))
        story.append(Paragraph(f"<b>Chemistry:</b> {recommended.get('chemistry', 'N/A')}", normal_style))
        story.append(Paragraph(f"<b>Subcategory:</b> {recommended.get('subcategory', 'N/A')}", normal_style))
        story.append(Spacer(1, 0.15*inch))
        story.append(Paragraph(f"<b>Rationale:</b> {recommended.get('rationale', 'N/A')}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Product Characteristics
        chars = spec.get('product_characteristics', {})
        story.append(Paragraph("PRODUCT CHARACTERISTICS", heading_style))
        char_data = [
            ["Viscosity Range:", chars.get('viscosity_range', 'N/A')],
            ["Color:", chars.get('color', 'N/A')],
            ["Cure Time:", chars.get('cure_time', 'N/A')],
            ["Expected Strength:", chars.get('expected_strength', 'N/A')],
            ["Temperature Resistance:", chars.get('temperature_resistance', 'N/A')],
            ["Flexibility:", chars.get('flexibility', 'N/A')],
            ["Gap Fill Capability:", chars.get('gap_fill_capability', 'N/A')]
        ]
        char_table = Table(char_data, colWidths=[2.5*inch, 4*inch])
        char_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(char_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Application Guidance
        guidance = spec.get('application_guidance', {})
        story.append(Paragraph("APPLICATION GUIDANCE", heading_style))
        
        if guidance.get('surface_preparation'):
            story.append(Paragraph("<b>Surface Preparation:</b>", subheading_style))
            for prep in guidance.get('surface_preparation', []):
                story.append(Paragraph(f"• {prep}", normal_style))
            story.append(Spacer(1, 0.15*inch))
        
        if guidance.get('application_tips'):
            story.append(Paragraph("<b>Application Tips:</b>", subheading_style))
            for tip in guidance.get('application_tips', []):
                story.append(Paragraph(f"• {tip}", normal_style))
            story.append(Spacer(1, 0.15*inch))
        
        if guidance.get('curing_notes'):
            story.append(Paragraph("<b>Curing Notes:</b>", subheading_style))
            for note in guidance.get('curing_notes', []):
                story.append(Paragraph(f"• {note}", normal_style))
            story.append(Spacer(1, 0.15*inch))
        
        if guidance.get('common_mistakes_to_avoid'):
            story.append(Paragraph("<b>Common Mistakes to Avoid:</b>", subheading_style))
            for mistake in guidance.get('common_mistakes_to_avoid', []):
                story.append(Paragraph(f"• {mistake}", normal_style))
            story.append(Spacer(1, 0.2*inch))
        
        # Warnings
        if spec.get('warnings'):
            story.append(Paragraph("WARNINGS & CONSIDERATIONS", heading_style))
            for warning in spec.get('warnings', []):
                story.append(Paragraph(f"⚠ {warning}", normal_style))
            story.append(Spacer(1, 0.3*inch))
        
        # Alternatives
        if spec.get('alternatives'):
            story.append(Paragraph("ALTERNATIVE APPROACHES", heading_style))
            for alt in spec.get('alternatives', []):
                story.append(Paragraph(f"<b>{alt.get('material_type', 'N/A')} - {alt.get('chemistry', 'N/A')}</b>", subheading_style))
                story.append(Paragraph(f"<b>When to Use:</b> {alt.get('when_to_use', 'N/A')}", normal_style))
                story.append(Spacer(1, 0.1*inch))
                
                if alt.get('advantages'):
                    story.append(Paragraph("<b>Advantages:</b>", normal_style))
                    for adv in alt.get('advantages', []):
                        story.append(Paragraph(f"• {adv}", normal_style))
                
                if alt.get('disadvantages'):
                    story.append(Paragraph("<b>Disadvantages:</b>", normal_style))
                    for dis in alt.get('disadvantages', []):
                        story.append(Paragraph(f"• {dis}", normal_style))
                
                story.append(Spacer(1, 0.2*inch))
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        story.append(Paragraph(f"Specification ID: {spec.get('id', 'N/A')}", footer_style))
        story.append(Paragraph("Generated by Gravix AI-Powered Materials Intelligence Platform", footer_style))
        story.append(Paragraph("This is a vendor-neutral specification. Consult with material suppliers for specific product recommendations.", footer_style))
        story.append(Paragraph("© 2026 Gravix. All rights reserved.", footer_style))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer


# Global instance
pdf_generator = PDFGenerator()
