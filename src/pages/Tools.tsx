import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const tools = [
    {
        name: 'BSR Recovery Dashboard',
        description: 'Track and analyze BSR trends, identify recovery opportunities',
        path: '/tools/bsr-recovery/',
        icon: '📈',
    },
    {
        name: 'Conversion Diagnostic',
        description: 'Diagnose conversion rate issues and find root causes',
        path: '/tools/conversion-diagnostic/',
        icon: '🔍',
    },
    {
        name: 'Buy Box Monitor',
        description: 'Monitor Buy Box status and competitor pricing',
        path: '/tools/buybox-monitor/',
        icon: '🏆',
    },
    {
        name: 'PPC Diagnostic',
        description: 'Analyze PPC campaigns, identify traffic and spend issues',
        path: '/tools/ppc-diagnostic/',
        icon: '💰',
    },
    {
        name: 'Inventory Health',
        description: 'Monitor stock levels, stranded inventory, and FBA issues',
        path: '/tools/inventory-health/',
        icon: '📦',
    },
];

export function Tools() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gravix-charcoal">
            {/* Header */}
            <header className="bg-gravix-slate border-b border-gravix-steel">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gravix-white">Gravix Tools</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gravix-gray-400 text-sm">{user?.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="text-gravix-gray-400 hover:text-gravix-white text-sm transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gravix-white mb-2">Diagnostic Dashboards</h2>
                    <p className="text-gravix-gray-400">Select a tool to analyze your Amazon business</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <a
                            key={tool.path}
                            href={tool.path}
                            className="bg-gravix-slate rounded-lg p-6 border border-gravix-steel hover:border-gravix-red transition-colors group"
                        >
                            <div className="text-4xl mb-4">{tool.icon}</div>
                            <h3 className="text-lg font-semibold text-gravix-white mb-2 group-hover:text-gravix-red transition-colors">
                                {tool.name}
                            </h3>
                            <p className="text-gravix-gray-400 text-sm">{tool.description}</p>
                        </a>
                    ))}
                </div>
            </main>
        </div>
    );
}
