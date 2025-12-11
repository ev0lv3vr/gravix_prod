import * as React from 'react';

import { Button } from '../ui/Button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginModal } from '../ui/LoginModal';

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [loginOpen, setLoginOpen] = React.useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-gravix-charcoal/90 backdrop-blur-md border-b border-gravix-slate/50">
                <div className="container-width flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-2">
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 bg-gravix-red rounded-sm flex items-center justify-center font-bold text-white text-xl">g</div>
                        <span className="text-2xl font-bold tracking-tight text-white">GRAVIX<span className="text-gravix-red text-lg align-top">™</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {['About', 'Industries', 'Product Range', 'Partnership'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-medium text-gravix-gray-400 hover:text-white transition-colors">
                                {item}
                            </a>
                        ))}
                        <Button variant="primary" size="sm" onClick={() => setLoginOpen(true)}>Distributor Access</Button>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-gravix-charcoal border-b border-gravix-slate/50 overflow-hidden"
                        >
                            <nav className="container-width py-4 flex flex-col space-y-4">
                                {['About', 'Industries', 'Product Range', 'Partnership'].map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase().replace(' ', '-')}`}
                                        className="text-base font-medium text-gravix-gray-400 hover:text-white transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item}
                                    </a>
                                ))}
                                <Button variant="primary" className="w-full" onClick={() => { setIsOpen(false); setLoginOpen(true); }}>Distributor Access</Button>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <LoginModal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </>
    );
}

import { Link } from 'react-router-dom';

export function Footer() {
    const [loginOpen, setLoginOpen] = React.useState(false);

    return (
        <footer className="bg-gravix-charcoal border-t border-gravix-slate/50 py-12 text-sm text-gravix-gray-400">
            <div className="container-width">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xl font-bold text-white">GRAVIX™</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                        <button
                            onClick={() => setLoginOpen(true)}
                            className="hover:text-white transition-colors text-left"
                        >
                            Distributor Portal
                        </button>
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gravix-slate/50 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>© 2024 gravix.com. All rights reserved.</p>
                </div>
            </div>

            <LoginModal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </footer>
    );
}
