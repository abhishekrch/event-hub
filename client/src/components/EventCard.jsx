import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function EventCard({ _id, name, date, location, category, image, attendees }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="aspect-w-16 aspect-h-9 transform transition-transform duration-500 hover:scale-110">
          <img
            src={image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'}
            alt={name}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-indigo-600">
          {category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {format(new Date(date), 'MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {format(new Date(date), 'h:mm a')}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">{attendees.length} attending</span>
          </div>
        </div>
        <Link
          to={`/event/${_id}`}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
        >
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default EventCard; 