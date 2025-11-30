import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminLogin = () => {
    const [email, setEmail] = useState('joycenwachukwu363@gmail.com');
    const [password, setPassword] = useState('Teens2025@');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setDebugInfo('');

        try {
            console.log('Attempting login with:', { email, password });
            setDebugInfo('Attempting login...');

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            console.log('Login response:', { data, error });
            setDebugInfo(`Login response: ${error ? 'Error' : 'Success'}`);

            if (error) {
                throw error;
            }

            if (data.user) {
                // Check if user has admin role
                const userRole = data.user.user_metadata?.role;
                console.log('User metadata:', data.user.user_metadata);
                setDebugInfo(`User role: ${userRole || 'No role assigned'}`);

                if (userRole === 'admin') {
                    setMessage('Login successful! Redirecting to admin panel...');
                    setTimeout(() => {
                        navigate('/admin');
                    }, 1000);
                } else {
                    setError('Access denied. Admin privileges required. User exists but has no admin role.');
                    setDebugInfo('User exists but missing admin role in metadata');
                    // Sign out non-admin users
                    await supabase.auth.signOut();
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message);

            // Provide more specific error messages
            if (error.message.includes('Invalid login credentials')) {
                setDebugInfo('User may not exist or password is incorrect. Try creating the user first.');
            } else if (error.message.includes('Email not confirmed')) {
                setDebugInfo('Email confirmation required. Check Supabase Auth settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        setDebugInfo('');

        try {
            setDebugInfo('Creating admin account...');

            // First, try to sign up the admin user with admin role
            const { data, error } = await supabase.auth.signUp({
                email: 'joycenwachukwu363@gmail.com',
                password: 'Teens2025@',
                options: {
                    data: {
                        role: 'admin'
                    }
                }
            });

            console.log('Signup response:', { data, error });
            setDebugInfo(`Signup response: ${error ? 'Error' : 'Success'}`);

            if (error) {
                // If user already exists, update the user metadata
                if (error.message.includes('already registered')) {
                    setDebugInfo('User already exists. Checking current role...');

                    // Try to sign in to check current role
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: 'joycenwachukwu363@gmail.com',
                        password: 'Teens2025@',
                    });

                    if (signInError) {
                        // If sign in fails, the password might be wrong
                        if (signInError.message.includes('Invalid login credentials')) {
                            setError('User exists but password is incorrect. Please reset password in Supabase dashboard.');
                            setDebugInfo('Password mismatch. Reset required.');
                        } else {
                            throw signInError;
                        }
                    } else if (signInData.user) {
                        // Check current role and update if needed
                        const currentRole = signInData.user.user_metadata?.role;
                        setDebugInfo(`Current user role: ${currentRole || 'None'}`);

                        if (currentRole !== 'admin') {
                            setMessage('User exists but needs admin role. Please update user metadata in Supabase dashboard.');
                            setDebugInfo('Admin role missing in user metadata');
                        } else {
                            setMessage('Admin user verified successfully! You can now login.');
                            setDebugInfo('User has admin role');
                        }
                    }
                } else {
                    throw error;
                }
            } else {
                // New user created successfully
                if (data.user) {
                    setMessage('Admin account created successfully! You can now login with the credentials.');
                    setDebugInfo('New admin user created');
                } else if (data.session) {
                    setMessage('Admin account created and logged in successfully!');
                    setDebugInfo('New admin user created and auto-logged in');
                    setTimeout(() => {
                        navigate('/admin');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Create admin error:', error);
            setError(error.message);
            setDebugInfo(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleManualFix = () => {
        setMessage('Please follow these steps manually:');
        setDebugInfo(`
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Email: joycenwachukwu363@gmail.com
4. Password: Teens2025@
5. User Metadata: {"role": "admin"}
6. Click "Create User"
        `);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
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

                    {debugInfo && (
                        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded text-sm">
                            <strong>Debug Info:</strong>
                            <pre className="whitespace-pre-wrap mt-2">{debugInfo}</pre>
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

                <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                    <h3 className="font-semibold mb-2 text-sm text-yellow-800">Quick Fix:</h3>
                    <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
                        <li>Click "Auto-Create/Verify Admin Account" first</li>
                        <li>If that fails, click "Show Manual Setup Instructions"</li>
                        <li>Follow the steps to manually create the user in Supabase</li>
                        <li>Then try logging in again</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;