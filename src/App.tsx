import { Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import { Home } from './pages/Home';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { useEffect } from 'react';

function App() {
    const location = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gravix-charcoal font-sans text-gravix-gray-100 selection:bg-gravix-red selection:text-white">
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>

            <Footer />
        </div>
    );
}

export default App;
