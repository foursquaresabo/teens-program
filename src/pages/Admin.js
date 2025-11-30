import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Admin = ({ session, user }) => {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [activeTab, setActiveTab] = useState('events');
    const [showEventForm, setShowEventForm] = useState(false);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const navigate = useNavigate();

    const [eventForm, setEventForm] = useState({
        title: '',
        speaker: '',
        position: '',
        district: '',
        event_date: '',
        event_time: '',
        duration: '',
        theme: '',
        bible_texts: '',
        description: '',
        type: 'upcoming'
    });

    const [registrationForm, setRegistrationForm] = useState({
        full_name: '',
        email: '',
        address: '',
        phone_number: '',
        class_vocation: '',
        church: '',
        event_id: ''
    });

    useEffect(() => {
        checkAdminAccess();
    }, [session, user]);

    const checkAdminAccess = async () => {
        if (!session) {
            navigate('/admin-login');
            return;
        }

        const role = user?.user_metadata?.role;
        if (role !== 'admin') {
            navigate('/admin-login');
            return;
        }

        setIsAdminUser(true);
        fetchData();
    };

    const fetchData = async () => {
        try {
            if (activeTab === 'events') {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .order('event_date', { ascending: false });

                if (error) throw error;
                setEvents(data || []);
            } else {
                const { data, error } = await supabase
                    .from('registrations')
                    .select(`
                        *,
                        events (title, event_date)
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setRegistrations(data || []);
            }
        } catch (error) {
            alert('Error fetching data. Please check your authentication.');
        } finally {
            setLoading(false);
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingEvent) {
                const { error } = await supabase
                    .from('events')
                    .update(eventForm)
                    .eq('id', editingEvent.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('events')
                    .insert([eventForm]);

                if (error) throw error;
            }

            resetEventForm();
            fetchData();
            setShowEventForm(false);
            alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
        } catch (error) {
            alert('Error saving event: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetEventForm = () => {
        setEventForm({
            title: '',
            speaker: '',
            position: '',
            district: '',
            event_date: '',
            event_time: '',
            duration: '',
            theme: '',
            bible_texts: '',
            description: '',
            type: 'upcoming'
        });
        setEditingEvent(null);
    };

    const handleEditEvent = (event) => {
        setEventForm({
            title: event.title,
            speaker: event.speaker,
            position: event.position,
            district: event.district,
            event_date: event.event_date,
            event_time: event.event_time,
            duration: event.duration,
            theme: event.theme,
            bible_texts: event.bible_texts,
            description: event.description,
            type: event.type
        });
        setEditingEvent(event);
        setShowEventForm(true);
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchData();
                alert('Event deleted successfully!');
            } catch (error) {
                alert('Error deleting event: ' + error.message);
            }
        }
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('registrations')
                .insert([registrationForm]);

            if (error) throw error;

            resetRegistrationForm();
            fetchData();
            setShowRegistrationForm(false);
            alert('Registration created successfully!');
        } catch (error) {
            alert('Error creating registration: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetRegistrationForm = () => {
        setRegistrationForm({
            full_name: '',
            email: '',
            address: '',
            phone_number: '',
            class_vocation: '',
            church: '',
            event_id: ''
        });
    };

    const handleDeleteRegistration = async (id) => {
        if (window.confirm('Are you sure you want to delete this registration?')) {
            try {
                const { error } = await supabase
                    .from('registrations')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchData();
                alert('Registration deleted successfully!');
            } catch (error) {
                alert('Error deleting registration: ' + error.message);
            }
        }
    };

    const prefillSampleEvent = () => {
        setEventForm({
            title: 'Teenager Spiritual Growth Program',
            speaker: 'Pastor David Adegboyega',
            position: 'District Teenager Pastor/Coordinator',
            district: 'Sabo Missionary District',
            event_date: '2025-11-20',
            event_time: '7:00 am – 10:00 am',
            duration: '3 hours',
            theme: 'Getting Deep in Christ',
            bible_texts: 'Isaiah 64:4; 1 Corinthians 2:9–16',
            description: 'To engage the teenagers in 3 hours of praying in tongues, seeking wisdom and divine direction to live a glorious and purpose-driven life. This program is intended to deepen the spiritual growth of our teenagers, strengthen their fellowship with God, and equip them with grace to navigate life\'s challenges.',
            type: 'upcoming'
        });
    };

    if (!isAdminUser) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (loading && events.length === 0 && registrations.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="text-sm text-gray-600">
                    Logged in as: {user?.email} (Admin)
                </div>
            </div>

            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'events'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab('events')}
                >
                    Events ({events.length})
                </button>
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'registrations'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => {
                        setActiveTab('registrations');
                        fetchData();
                    }}
                >
                    Registrations ({registrations.length})
                </button>
            </div>

            {activeTab === 'events' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Events Management</h2>
                        <div className="space-x-2">
                            <button
                                onClick={prefillSampleEvent}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                            >
                                Prefill Sample
                            </button>
                            <button
                                onClick={() => setShowEventForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Add New Event
                            </button>
                        </div>
                    </div>

                    {showEventForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-4">
                                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                                </h3>
                                <form onSubmit={handleEventSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title *</label>
                                            <input
                                                type="text"
                                                value={eventForm.title}
                                                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Speaker *</label>
                                            <input
                                                type="text"
                                                value={eventForm.speaker}
                                                onChange={(e) => setEventForm({...eventForm, speaker: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Position *</label>
                                            <input
                                                type="text"
                                                value={eventForm.position}
                                                onChange={(e) => setEventForm({...eventForm, position: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">District *</label>
                                            <input
                                                type="text"
                                                value={eventForm.district}
                                                onChange={(e) => setEventForm({...eventForm, district: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date *</label>
                                            <input
                                                type="date"
                                                value={eventForm.event_date}
                                                onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Time *</label>
                                            <input
                                                type="text"
                                                value={eventForm.event_time}
                                                onChange={(e) => setEventForm({...eventForm, event_time: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Duration *</label>
                                            <input
                                                type="text"
                                                value={eventForm.duration}
                                                onChange={(e) => setEventForm({...eventForm, duration: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Type *</label>
                                            <select
                                                value={eventForm.type}
                                                onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="upcoming">Upcoming</option>
                                                <option value="current">Current</option>
                                                <option value="past">Past</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Theme *</label>
                                        <input
                                            type="text"
                                            value={eventForm.theme}
                                            onChange={(e) => setEventForm({...eventForm, theme: e.target.value})}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bible Texts *</label>
                                        <input
                                            type="text"
                                            value={eventForm.bible_texts}
                                            onChange={(e) => setEventForm({...eventForm, bible_texts: e.target.value})}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description *</label>
                                        <textarea
                                            value={eventForm.description}
                                            onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                                            required
                                            rows="4"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEventForm(false);
                                                resetEventForm();
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingEvent ? 'Update' : 'Create')} Event
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{event.title}</h3>
                                        <p className="text-gray-600">{event.speaker} - {event.position}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(event.event_date).toLocaleDateString()} | {event.event_time} | {event.type}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">{event.theme}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditEvent(event)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'registrations' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Registrations Management</h2>
                        <button
                            onClick={() => setShowRegistrationForm(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Add New Registration
                        </button>
                    </div>

                    {showRegistrationForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-4">Add New Registration</h3>
                                <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                            <input
                                                type="text"
                                                value={registrationForm.full_name}
                                                onChange={(e) => setRegistrationForm({...registrationForm, full_name: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={registrationForm.email}
                                                onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={registrationForm.phone_number}
                                                onChange={(e) => setRegistrationForm({...registrationForm, phone_number: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Class/Vocation *</label>
                                            <input
                                                type="text"
                                                value={registrationForm.class_vocation}
                                                onChange={(e) => setRegistrationForm({...registrationForm, class_vocation: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Church *</label>
                                            <input
                                                type="text"
                                                value={registrationForm.church}
                                                onChange={(e) => setRegistrationForm({...registrationForm, church: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Event *</label>
                                            <select
                                                value={registrationForm.event_id}
                                                onChange={(e) => setRegistrationForm({...registrationForm, event_id: e.target.value})}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Event</option>
                                                {events.map(event => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.title} ({new Date(event.event_date).toLocaleDateString()})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            value={registrationForm.address}
                                            onChange={(e) => setRegistrationForm({...registrationForm, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowRegistrationForm(false);
                                                resetRegistrationForm();
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Creating...' : 'Create Registration'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                <th className="px-4 py-2 text-left">Class/Vocation</th>
                                <th className="px-4 py-2 text-left">Church</th>
                                <th className="px-4 py-2 text-left">Event</th>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {registrations.map(reg => (
                                <tr key={reg.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        <div>
                                            <div className="font-medium">{reg.full_name}</div>
                                            {reg.email && <div className="text-sm text-gray-500">{reg.email}</div>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">{reg.phone_number}</td>
                                    <td className="px-4 py-2">{reg.class_vocation}</td>
                                    <td className="px-4 py-2">{reg.church}</td>
                                    <td className="px-4 py-2">
                                        <div>
                                            <div className="font-medium">{reg.events?.title}</div>
                                            <div className="text-sm text-gray-500">
                                                {reg.events?.event_date && new Date(reg.events.event_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => handleDeleteRegistration(reg.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;