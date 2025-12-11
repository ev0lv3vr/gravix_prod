/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gravix-slate': '#1E293B',
                'gravix-steel': '#475569',
                'gravix-charcoal': '#0F172A',
                'gravix-red': '#991B1B',
                'gravix-red-hover': '#7F1D1D',
                'gravix-gray-100': '#F1F5F9',
                'gravix-gray-200': '#E2E8F0',
                'gravix-gray-400': '#94A3B8',
                'gravix-white': '#FFFFFF',
                'gravix-success': '#166534',
            },
            fontFamily: {
                sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
