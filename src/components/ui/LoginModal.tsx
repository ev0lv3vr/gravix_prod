import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                navigate('/tools');
            }, 1000);
        }
    };

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setFormData({ email: '', password: '' });
            setError('');
            setSuccess(false);
            setLoading(false);
        }
    }, [isOpen]);

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
                            {success ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">Welcome Back!</h2>
                                    <p className="text-gravix-gray-400 text-sm">
                                        Redirecting to dashboard...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-gravix-slate border border-gravix-steel/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Lock className="w-5 h-5 text-gravix-red" />
                                        </div>
                                        <h2 className="text-xl font-bold text-white mb-1">Tools Portal</h2>
                                        <p className="text-gravix-gray-400 text-xs">
                                            Sign in to access dashboards and analytics.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-3 py-2 rounded mb-4 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="login-email" className="text-xs font-bold text-gravix-gray-400 uppercase">Email</label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                required
                                                disabled={loading}
                                                className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors disabled:opacity-50"
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
                                                disabled={loading}
                                                className="w-full bg-gravix-charcoal border border-gravix-steel/50 rounded px-3 py-2 text-white focus:border-gravix-red focus:outline-none transition-colors disabled:opacity-50"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Signing in...
                                                </span>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
