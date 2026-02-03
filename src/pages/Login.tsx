import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);
        
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/tools');
        }
    };

    return (
        <div className="min-h-screen bg-gravix-charcoal flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gravix-white mb-2">Gravix Tools</h1>
                    <p className="text-gravix-gray-400">Sign in to access your dashboards</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gravix-slate rounded-lg p-8 shadow-xl">
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gravix-gray-200 text-sm font-medium mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gravix-charcoal border border-gravix-steel rounded-lg text-gravix-white placeholder-gravix-gray-400 focus:outline-none focus:border-gravix-red transition-colors"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gravix-gray-200 text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gravix-charcoal border border-gravix-steel rounded-lg text-gravix-white placeholder-gravix-gray-400 focus:outline-none focus:border-gravix-red transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gravix-red hover:bg-gravix-red-hover text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
