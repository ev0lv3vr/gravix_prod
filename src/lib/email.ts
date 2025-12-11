import emailjs from '@emailjs/browser';

// Replace these with your actual keys from EmailJS Dashboard
// Ideally, use environment variables: import.meta.env.VITE_EMAILJS_SERVICE_ID, etc.
const SERVICE_ID = 'service_m8cfa2q';
const TEMPLATE_ID = 'template_ywnmej9';
const PUBLIC_KEY = 'pKAaQ0mXxlw2pS9by';

export const sendEmail = async (data: Record<string, unknown>) => {
    try {
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            data,
            PUBLIC_KEY
        );
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS Error:', error);
        return { success: false, error };
    }
};
