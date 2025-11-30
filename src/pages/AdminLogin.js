import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminLogin = () => {
    const [email, setEmail] = useState('joycenwachukwu363@gmail.com');
    const [password, setPassword] = useState('Teens2025@');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                const userRole = data.user.user_metadata?.role;

                if (userRole === 'admin') {
                    setMessage('Login successful! Redirecting...');
                    setTimeout(() => {
                        navigate('/admin');
                    }, 1000);
                } else {
                    setError('Access denied. Admin privileges required.');
                    await supabase.auth.signOut();
                }
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email: 'joycenwachukwu363@gmail.com',
                password: 'Teens2025@',
                options: {
                    data: {
                        role: 'admin'
                    }
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: 'joycenwachukwu363@gmail.com',
                        password: 'Teens2025@',
                    });

                    if (signInError) throw signInError;

                    const currentRole = signInData.user.user_metadata?.role;

                    if (currentRole !== 'admin') {
                        setMessage('User exists but needs admin role. Please update user metadata in Supabase dashboard.');
                    } else {
                        setMessage('Admin user verified successfully! You can now login.');
                    }
                } else {
                    throw error;
                }
            } else {
                if (data.user) {
                    setMessage('Admin account created successfully! You can now login with the credentials.');
                } else if (data.session) {
                    setMessage('Admin account created and logged in successfully!');
                    setTimeout(() => {
                        navigate('/admin');
                    }, 1000);
                }
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManualFix = () => {
        setMessage('Please follow these steps manually:');
        setError(`
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: joycenwachukwu363@gmail.com
4. Password: Teens2025@
5. User Metadata: {"role": "admin"}
6. Click "Create User"
        `);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-md">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Admin Login
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleCreateAdmin}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Checking...' : 'Auto-Create/Verify Admin Account'}
                    </button>

                    <button
                        onClick={handleManualFix}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                        Show Manual Setup Instructions
                    </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                        <strong>Credentials to use:</strong><br />
                        Email: joycenwachukwu363@gmail.com<br />
                        Password: Teens2025@
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;