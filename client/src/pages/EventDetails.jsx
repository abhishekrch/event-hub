import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Share2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [isAttending, setIsAttending] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('/');
    setSocket(newSocket);

    newSocket.emit('joinEvent', id);

    newSocket.on('attendeeUpdate', (updatedAttendees) => {
      setAttendees(updatedAttendees);
    });

    return () => {
      newSocket.close();
    };
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/events/${id}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();
      console.log('Event data:', data);
      console.log('Image URL:', data.image);
      setEvent(data);
      setAttendees(data.attendees);
      setIsAttending(data.attendees.some(a => a._id === user?._id));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAttend = async () => {
    if (!user) {
      toast.error('Please login to attend events');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/api/events/${id}/attend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to join event');
      
      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setIsAttending(true);
      
      socket.emit('attendeeJoined', { eventId: id, user });
      toast.success('Successfully joined the event!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!event) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-96">
          <img
            src={event.image || 'https://via.placeholder.com/800x400?text=No+Image+Available'}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=No+Image+Available';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-8 text-white">
              <div className="inline-block px-4 py-1 rounded-full bg-indigo-600 text-sm font-semibold mb-4">
                {event.category}
              </div>
              <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{format(new Date(event.date), 'h:mm a')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          <div className="lg:col-span-2">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">About this event</h2>
              <p className="text-gray-600">{event.description}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Location</h3>
              <div className="bg-gray-50 rounded-lg p-4 flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Attendees</h3>
              <div className="flex flex-wrap gap-4">
                {attendees.map((attendee) => (
                  <div
                    key={attendee._id}
                    className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {attendee.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{attendee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ${event.price === 0 ? 'Free' : event.price}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleAttend}
                  disabled={isAttending}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isAttending
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isAttending ? 'Attending' : 'Attend Event'}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-3 px-4 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Event
                </button>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{attendees.length} attending</span>
                  </div>
                  <span>{event.capacity - attendees.length} spots left</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${(attendees.length / event.capacity) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div> </div>
        </div>
      </div>
  );
}

export default EventDetails;