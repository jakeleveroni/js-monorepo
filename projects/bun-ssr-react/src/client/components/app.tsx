import type React from 'react';
import { useState } from 'react';
import { useWeather } from '../server-components/weather-provider';

function App() {
  const { data, isLoading, error, refreshWeather, setLocation } = useWeather();
  const [newLocation, setNewLocation] = useState('');

  // Handle location update
  const handleLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation.trim()) {
      setLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  if (error) {
    return <div className="error">Error loading weather data: {error}</div>;
  }

  if (!data) {
    return <div className="loading">Loading weather data...</div>;
  }

  return (
    <div className="app">
      <h1>Current Weather for {data.location}</h1>

      <div className="weather-card">
        {isLoading ? (
          <p>Updating weather information...</p>
        ) : (
          <div className="weather-details">
            <p className="temperature">{data.temperature}°F</p>
            <p>Conditions: {data.conditions}</p>
            <p>Humidity: {data.humidity}%</p>
            <p>Wind Speed: {data.windSpeed} mph</p>
            <p className="update-time">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        )}

        <div className="actions">
          <button type="button" onClick={() => refreshWeather()} disabled={isLoading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="location-form">
        <form onSubmit={handleLocationUpdate}>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter a new location"
          />
          <button type="submit" disabled={isLoading || !newLocation.trim()}>
            Update Location
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
