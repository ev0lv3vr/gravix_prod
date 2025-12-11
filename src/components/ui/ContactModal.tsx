import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from './Button';

import { sendEmail } from '../../lib/email';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTopic?: string;
    variant?: 'general' | 'distributor';
}

export function ContactModal({ isOpen, onClose, defaultTopic = "General Inquiry", variant = 'general' }: ContactModalProps) {
    const [step, setStep] = React.useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        company: '',
        message: '',
        industry: '',
        currentAdhesive: '',
        volume: '',
        painPoint: '',
        topic: defaultTopic
    });

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setStep('form');
            setIsSubmitting(false);
            setFormData(prev => ({
                ...prev,
                topic: defaultTopic,
                // Reset specific fields if needed, but keeping simple for now
            }));
        }
    }, [isOpen, defaultTopic]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await sendEmail(formData);

        setIsSubmitting(false);
        if (result.success) {
            setStep('success');
        } else {
            alert('Failed to send email. Please try again later.');
            console.error(result.error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 custom-scrollbar overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gravix-charcoal/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-gravix-slate border border-gravix-steel/30 rounded-lg shadow-2xl overflow-hidden my-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 z-10 text-gravix-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 sm:p-8">
                            {step === 'form' ? (
                                <>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {variant === 'distributor' ? 'Request Distributor Access' : 'Contact Gravix'}
                                    </h2>
                                    <p className="text-gravix-gray-400 mb-6 text-sm">
                                        {variant === 'distributor'
                                            ? 'Complete the profile below to receive your volume quote and sample kit.'
                                            : 'Fill out the form below to connect with our procurement team.'}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Common Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-xs font-bold text-gravix-gray-400 uppercase">Name</label>
                                                <input
                                                    id="name"
                                                    required
                                                    className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-xs font-bold text-gravix-gray-400 uppercase">Work Email</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="company" className="text-xs font-bold text-gravix-gray-400 uppercase">Company Name</label>
                                            <input
                                                id="company"
                                                required
                                                className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors"
                                                value={formData.company}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>

                                        {variant === 'distributor' ? (
                                            <>
                                                {/* Distributor Specific Fields */}
                                                <div className="space-y-2">
                                                    <label htmlFor="industry" className="text-xs font-bold text-gravix-gray-400 uppercase">Industry</label>
                                                    <select
                                                        id="industry"
                                                        required
                                                        className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors appearance-none"
                                                        value={formData.industry}
                                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                                    >
                                                        <option value="">Select Industry</option>
                                                        <option value="Woodworking">Woodworking</option>
                                                        <option value="Packaging">Packaging</option>
                                                        <option value="Flooring">Flooring</option>
                                                        <option value="Industrial">Industrial</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="currentAdhesive" className="text-xs font-bold text-gravix-gray-400 uppercase">Current Adhesive</label>
                                                    <input
                                                        id="currentAdhesive"
                                                        placeholder="e.g., Loctite 401, Starbond"
                                                        className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors placeholder:text-gray-600"
                                                        value={formData.currentAdhesive}
                                                        onChange={e => setFormData({ ...formData, currentAdhesive: e.target.value })}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label htmlFor="volume" className="text-xs font-bold text-gravix-gray-400 uppercase">Est. Monthly Volume</label>
                                                        <select
                                                            id="volume"
                                                            required
                                                            className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors appearance-none"
                                                            value={formData.volume}
                                                            onChange={e => setFormData({ ...formData, volume: e.target.value })}
                                                        >
                                                            <option value="">Select Volume</option>
                                                            <option value="<1 Gallon">&lt;1 Gallon</option>
                                                            <option value="1–5 Gallons">1–5 Gallons</option>
                                                            <option value="5–50 Gallons">5–50 Gallons</option>
                                                            <option value="55+ Gallons">55+ Gallons</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor="painPoint" className="text-xs font-bold text-gravix-gray-400 uppercase">Primary Pain Point</label>
                                                        <select
                                                            id="painPoint"
                                                            required
                                                            className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors appearance-none"
                                                            value={formData.painPoint}
                                                            onChange={e => setFormData({ ...formData, painPoint: e.target.value })}
                                                        >
                                                            <option value="">Select Issue</option>
                                                            <option value="Stockouts">Stockouts</option>
                                                            <option value="Inconsistent Quality">Inconsistent Quality</option>
                                                            <option value="Price">Price</option>
                                                            <option value="Blooming">Blooming</option>
                                                            <option value="Drying Time">Drying Time</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            /* General Inquiry Textarea */
                                            <div className="space-y-2">
                                                <label htmlFor="message" className="text-xs font-bold text-gravix-gray-400 uppercase">Requirement Details</label>
                                                <textarea
                                                    id="message"
                                                    rows={4}
                                                    required
                                                    className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors resize-none"
                                                    value={formData.message}
                                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                                            {isSubmitting ? 'Sending...' : (variant === 'distributor' ? 'GET MY QUOTE & SAMPLES' : 'Send Inquiry')}
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gravix-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-8 h-8 text-gravix-success" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Inquiry Received</h2>
                                    <p className="text-gravix-gray-400 mb-8">
                                        Our team at Gravix will review your requirements and follow up within 24 hours at <span className="text-white">{formData.email}</span>.
                                    </p>
                                    <Button onClick={onClose} variant="secondary">Close</Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
