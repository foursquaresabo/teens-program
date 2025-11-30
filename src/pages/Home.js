import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Home = () => {
    const [currentEvent, setCurrentEvent] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            // Fetch current event
            const { data: currentData, error: currentError } = await supabase
                .from('events')
                .select('*')
                .eq('type', 'current')
                .single();

            if (currentError && currentError.code !== 'PGRST116') {
                throw currentError;
            }

            // Fetch upcoming events
            const { data: upcomingData, error: upcomingError } = await supabase
                .from('events')
                .select('*')
                .eq('type', 'upcoming')
                .order('event_date', { ascending: true })
                .limit(3);

            if (upcomingError) throw upcomingError;

            setCurrentEvent(currentData);
            setUpcomingEvents(upcomingData || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">
                    Welcome to Teenager Spiritual Growth Events
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    Empowering teenagers through spiritual growth, fellowship, and divine direction for a purpose-driven life.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link
                        to="/events"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                    >
                        Explore Events
                    </Link>
                    <Link
                        to="/events"
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold"
                    >
                        Get Involved
                    </Link>
                </div>
            </div>

            {/* Current Event Section */}
            <div className="max-w-6xl mx-auto">
                {currentEvent ? (
                    <div className="bg-white rounded-lg shadow-xl p-8 mb-12 border border-blue-200">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-blue-600">Current Event</h2>
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Happening Now
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2">{currentEvent.title}</h3>
                                <p className="text-lg text-gray-600">{currentEvent.speaker}</p>
                                <p className="text-gray-500">{currentEvent.position}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Event Details</h4>
                                        <p><strong>District:</strong> {currentEvent.district}</p>
                                        <p><strong>Date:</strong> {new Date(currentEvent.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p><strong>Time:</strong> {currentEvent.event_time}</p>
                                        <p><strong>Duration:</strong> {currentEvent.duration}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-800 mb-2">Spiritual Focus</h4>
                                        <p><strong>Theme:</strong> {currentEvent.theme}</p>
                                        <p><strong>Bible Texts:</strong> {currentEvent.bible_texts}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-3">About This Event</h4>
                                <p className="text-gray-700 leading-relaxed">{currentEvent.description}</p>
                            </div>

                            <div className="text-center">
                                <Link
                                    to={`/register/${currentEvent.id}`}
                                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
                                >
                                    Register Now - Join Us Today!
                                </Link>
                                <p className="text-sm text-gray-500 mt-2">
                                    Free registration • Open to all teenagers • Spiritual growth guaranteed
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center mb-12">
                        <div className="text-yellow-600 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-yellow-800 mb-2">No Current Events</h3>
                        <p className="text-yellow-700 mb-4">We're preparing something amazing for you! Check back soon for upcoming spiritual growth events.</p>
                        <Link
                            to="/events"
                            className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
                        >
                            View Past Events
                        </Link>
                    </div>
                )}

                {/* Upcoming Events Section */}
                {upcomingEvents.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Upcoming Events</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="bg-white rounded-lg shadow-md p-6 border border-green-200 hover:shadow-lg transition duration-200">
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold inline-block mb-3">
                                        Coming Soon
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                                    <p className="text-gray-600 mb-2">{event.speaker}</p>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {new Date(event.event_date).toLocaleDateString()} • {event.event_time}
                                    </p>
                                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{event.description.substring(0, 100)}...</p>
                                    <Link
                                        to={`/events`}
                                        className="text-green-600 hover:text-green-700 font-semibold text-sm"
                                    >
                                        Learn More →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* About Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Why Join Our Teenager Events?</h2>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🙏</span>
                                </div>
                                <h3 className="font-semibold mb-2">Spiritual Growth</h3>
                                <p className="text-blue-100 text-sm">Deepen your relationship with God and strengthen your faith</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <h3 className="font-semibold mb-2">Christian Fellowship</h3>
                                <p className="text-blue-100 text-sm">Connect with other teenagers on the same spiritual journey</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h3 className="font-semibold mb-2">Purpose Discovery</h3>
                                <p className="text-blue-100 text-sm">Find divine direction for your life and God's purpose for you</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gray-50 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Grow Spiritually?</h2>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Join our community of teenagers seeking God's purpose. Whether you're new in faith or growing deeper, there's a place for you here.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            to="/events"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
                        >
                            Browse All Events
                        </Link>
                        <Link
                            to="/events"
                            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition duration-200 font-semibold"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">100+</div>
                        <div className="text-gray-600 text-sm">Teens Impacted</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600">50+</div>
                        <div className="text-gray-600 text-sm">Events Hosted</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">12</div>
                        <div className="text-gray-600 text-sm">Months of Growth</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-orange-600">5</div>
                        <div className="text-gray-600 text-sm">Districts Reached</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;