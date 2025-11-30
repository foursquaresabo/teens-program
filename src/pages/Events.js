import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Events = () => {
    const [events, setEvents] = useState({ upcoming: [], current: [], past: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: false });

            if (error) throw error;

            const categorizedEvents = {
                upcoming: data.filter(event => event.type === 'upcoming'),
                current: data.filter(event => event.type === 'current'),
                past: data.filter(event => event.type === 'past'),
            };

            setEvents(categorizedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const EventCard = ({ event }) => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">{event.title}</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p><strong>Speaker:</strong> {event.speaker}</p>
                    <p><strong>Position:</strong> {event.position}</p>
                    <p><strong>District:</strong> {event.district}</p>
                </div>
                <div>
                    <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {event.event_time}</p>
                    <p><strong>Theme:</strong> {event.theme}</p>
                </div>
            </div>
            <p className="text-gray-700 mb-4">{event.description}</p>
            {event.type !== 'past' && (
                <Link
                    to={`/register/${event.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Register
                </Link>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">Loading events...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Events</h1>

            <div className="flex border-b mb-6">
                {['upcoming', 'current', 'past'].map(tab => (
                    <button
                        key={tab}
                        className={`px-4 py-2 font-medium capitalize ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab} Events ({events[tab].length})
                    </button>
                ))}
            </div>

            <div>
                {events[activeTab].length > 0 ? (
                    events[activeTab].map(event => (
                        <EventCard key={event.id} event={event} />
                    ))
                ) : (
                    <div className="text-center text-gray-600 py-8">
                        No {activeTab} events found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;