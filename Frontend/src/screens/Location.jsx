
import React from 'react';
import { useSelector } from 'react-redux';

const Location = () => {
  const { city } = useSelector((state) => state.user);

  return (
    <div className="container mt-5">
      <h2>Your Location</h2>
      <p>Your currently detected city is: <strong>{city || 'Not available'}</strong></p>
      <p>This page can be used to manually set or update your location in the future.</p>
    </div>
  );
};

export default Location;
