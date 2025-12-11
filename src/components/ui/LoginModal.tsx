import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { Button } from './Button';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [step, setStep] = React.useState<'form' | 'success'>('form');
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate Login
        setTimeout(() => {
            setStep('success');
            console.log('Logging in user:', formData.email);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gravix-charcoal/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-gravix-slate border border-gravix-steel/30 rounded-lg shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gravix-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 sm:p-8">
                            {step === 'form' ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-gravix-slate border border-gravix-steel/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Lock className="w-5 h-5 text-gravix-red" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-1">Distributor Portal</h2>
                                        <p className="text-gravix-gray-400 text-xs">
                                            Enter your credentials to access the VMI dashboard.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="login-email" className="text-xs font-bold text-gravix-gray-400 uppercase">Email</label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                required
                                                className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="login-password" className="text-xs font-bold text-gravix-gray-400 uppercase">Password</label>
                                            <input
                                                id="login-password"
                                                type="password"
                                                required
                                                className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit" className="w-full mt-2">Sign In</Button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gravix-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <X className="w-8 h-8 text-gravix-red" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                                    <p className="text-gravix-gray-400 mb-8 text-sm">
                                        Please contact procurement for authorization.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
