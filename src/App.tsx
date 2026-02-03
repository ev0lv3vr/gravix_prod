import { Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import { Home } from './pages/Home';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Login } from './pages/Login';
import { Tools } from './pages/Tools';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';

function App() {
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Don't show header/footer on login and tools pages
    const hideLayout = location.pathname === '/login' || location.pathname === '/tools';

    return (
        <div className="min-h-screen bg-gravix-charcoal font-sans text-gravix-gray-100 selection:bg-gravix-red selection:text-white">
            {!hideLayout && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/tools"
                    element={
                        <ProtectedRoute>
                            <Tools />
                        </ProtectedRoute>
                    }
                />
            </Routes>

            {!hideLayout && <Footer />}
        </div>
    );
}

export default App;
