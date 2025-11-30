import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Navbar = ({ session, user }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const isAdmin = user?.user_metadata?.role === 'admin';

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-xl font-bold">Teenager Events</Link>

                    <div className="flex space-x-4">
                        {/* Public navigation - always visible */}
                        <Link
                            to="/"
                            className={`hover:text-blue-200 ${location.pathname === '/' ? 'text-blue-200 underline' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/events"
                            className={`hover:text-blue-200 ${location.pathname === '/events' ? 'text-blue-200 underline' : ''}`}
                        >
                            Events
                        </Link>

                        {/* Admin navigation - only for admins */}
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`hover:text-blue-200 ${location.pathname === '/admin' ? 'text-blue-200 underline' : ''}`}
                            >
                                Admin
                            </Link>
                        )}

                        {/* Auth navigation */}
                        {session ? (
                            <button
                                onClick={handleLogout}
                                className="hover:text-blue-200"
                            >
                                Logout ({user?.email})
                            </button>
                        ) : (
                            <Link
                                to="/admin-login"
                                className={`hover:text-blue-200 ${location.pathname === '/admin-login' ? 'text-blue-200 underline' : ''}`}
                            >
                                Admin Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;