import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Filter, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';

function Dashboard() {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    date: 'all',
    search: ''
  });

  const categories = [
    'All',
    'Conference',
    'Workshop',
    'Networking',
    'Concert',
    'Exhibition',
    'Sports'
  ];

  useEffect(() => {
    fetchEvents();
    fetchFeaturedEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/events?` + new URLSearchParams(filters));
      
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); 
    }
  };

  const fetchFeaturedEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/events?limit=3`);
      if (!response.ok) throw new Error('Failed to fetch featured events');
      const data = await response.json();
      setFeaturedEvents(data);
    } catch (error) {
      console.error('Error fetching featured events:', error);
      setFeaturedEvents([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events Dashboard</h1>
        <Link
          to="/create-event"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create Event
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Events
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>


      {/* Featured Events Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event._id} {...event} />
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}

export default Dashboard;