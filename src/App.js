import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import Registration from './pages/Registration';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import { supabase } from './lib/supabase';

function App() {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('Initial session:', session);
            setSession(session);

            if (session) {
                setUser(session.user);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            setSession(session);

            if (session) {
                setUser(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navbar session={session} user={user} />
                <Routes>
                    {/* Public routes - accessible to everyone */}
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/register/:eventId" element={<Registration />} />

                    {/* Admin routes */}
                    <Route
                        path="/admin-login"
                        element={<AdminLogin />}
                    />
                    <Route
                        path="/admin"
                        element={<Admin session={session} user={user} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;