import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rideService } from '../services/rideService';
import type { CreateRideData } from '../types/ride';

interface RideFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const RideForm: React.FC<RideFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateRideData>({
    departureTime: '',
    startLocation: '',
    destination: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Not authenticated');
      return;
    }

    // Validate form
    if (!formData.startLocation.trim()) {
      setError('Start location is required');
      return;
    }
    if (!formData.destination.trim()) {
      setError('Destination is required');
      return;
    }
    if (!formData.departureTime) {
      setError('Departure time is required');
      return;
    }

    // Check if departure time is in the future
    const departureDate = new Date(formData.departureTime);
    const now = new Date();
    if (departureDate <= now) {
      setError('Departure time must be in the future');
      return;
    }

    setLoading(true);

    try {
      await rideService.createRide(
        currentUser.uid,
        currentUser.email || '',
        formData
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date/time (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Start Location *
          </label>
          <input
            type="text"
            id="startLocation"
            name="startLocation"
            value={formData.startLocation}
            onChange={handleInputChange}
            placeholder="e.g., University of Waterloo"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination *
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
            placeholder="e.g., Toronto Pearson Airport"
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">
          Departure Time *
        </label>
        <input
          type="datetime-local"
          id="departureTime"
          name="departureTime"
          value={formData.departureTime}
          onChange={handleInputChange}
          min={getMinDateTime()}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional information (e.g., cost sharing, pickup details, etc.)"
          rows={3}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Posting...' : 'Post Ride'}
        </button>
      </div>
    </form>
  );
};

export default RideForm;