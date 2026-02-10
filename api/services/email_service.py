"""
Email service using Resend API.
"""
import httpx
from config import settings
from typing import Dict, Any, Optional


class EmailService:
    """Service for sending transactional emails."""
    
    def __init__(self):
        self.api_key = settings.resend_api_key
        self.from_email = settings.from_email
        self.base_url = "https://api.resend.com/emails"
    
    async def send_welcome_email(self, to_email: str, name: Optional[str] = None) -> Dict[str, Any]:
        """
        Send welcome email to new user.
        
        Args:
            to_email: Recipient email
            name: User name (optional)
            
        Returns:
            Response dict from Resend API
        """
        subject = "Welcome to Gravix!"
        
        greeting = f"Hi {name}," if name else "Hi there,"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Welcome to Gravix</h1>
                <p>{greeting}</p>
                <p>Thank you for signing up! Gravix helps you diagnose adhesive failures and generate material specifications using AI-powered intelligence.</p>
                
                <h2 style="color: #1e40af;">What You Can Do:</h2>
                <ul>
                    <li><strong>Diagnose Failures:</strong> Get root cause analysis for adhesive, sealant, and coating failures in minutes</li>
                    <li><strong>Specify Materials:</strong> Generate vendor-neutral specifications for your bonding applications</li>
                    <li><strong>Browse Case Library:</strong> Learn from real-world failure cases and solutions</li>
                </ul>
                
                <p style="margin-top: 30px;">
                    <a href="https://gravix.com/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
                </p>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    Questions? Reply to this email — we'd love to hear from you.
                </p>
                
                <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="font-size: 12px; color: #9ca3af;">
                    Gravix — AI-Powered Industrial Materials Intelligence<br />
                    © 2026 Gravix. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        return await self._send_email(to_email, subject, html)
    
    async def send_analysis_ready_email(
        self, 
        to_email: str, 
        analysis_id: str,
        failure_mode: str,
        name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send notification that failure analysis is ready.
        
        Args:
            to_email: Recipient email
            analysis_id: Analysis ID
            failure_mode: Type of failure analyzed
            name: User name (optional)
            
        Returns:
            Response dict from Resend API
        """
        subject = "Your Failure Analysis is Ready"
        
        greeting = f"Hi {name}," if name else "Hi there,"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Your Analysis is Ready</h1>
                <p>{greeting}</p>
                <p>Your failure analysis for <strong>{failure_mode}</strong> is complete and ready to view.</p>
                
                <p style="margin-top: 30px;">
                    <a href="https://gravix.com/analyze/{analysis_id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Analysis</a>
                </p>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    Your report includes root cause analysis, recommendations, and a prevention plan. You can download a PDF from the results page.
                </p>
                
                <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="font-size: 12px; color: #9ca3af;">
                    Gravix — AI-Powered Industrial Materials Intelligence<br />
                    © 2026 Gravix. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        return await self._send_email(to_email, subject, html)
    
    async def send_spec_ready_email(
        self, 
        to_email: str, 
        spec_id: str,
        substrate_a: str,
        substrate_b: str,
        name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send notification that specification is ready.
        
        Args:
            to_email: Recipient email
            spec_id: Spec request ID
            substrate_a: First substrate
            substrate_b: Second substrate
            name: User name (optional)
            
        Returns:
            Response dict from Resend API
        """
        subject = "Your Material Specification is Ready"
        
        greeting = f"Hi {name}," if name else "Hi there,"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Your Specification is Ready</h1>
                <p>{greeting}</p>
                <p>Your material specification for <strong>{substrate_a}</strong> to <strong>{substrate_b}</strong> bonding is complete.</p>
                
                <p style="margin-top: 30px;">
                    <a href="https://gravix.com/specify/{spec_id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Specification</a>
                </p>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    Your specification includes recommended materials, application guidance, and alternative approaches. You can download a PDF from the results page.
                </p>
                
                <hr style="margin-top: 40px; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="font-size: 12px; color: #9ca3af;">
                    Gravix — AI-Powered Industrial Materials Intelligence<br />
                    © 2026 Gravix. All rights reserved.
                </p>
            </div>
        </body>
        </html>
        """
        
        return await self._send_email(to_email, subject, html)
    
    async def _send_email(self, to_email: str, subject: str, html: str) -> Dict[str, Any]:
        """
        Send email via Resend API.
        
        Args:
            to_email: Recipient email
            subject: Email subject
            html: HTML email body
            
        Returns:
            Response dict from Resend API
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": self.from_email,
            "to": [to_email],
            "subject": subject,
            "html": html
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=10.0
            )
            
            response.raise_for_status()
            return response.json()


# Global instance
email_service = EmailService()
