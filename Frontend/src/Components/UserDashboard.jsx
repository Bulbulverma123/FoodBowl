import React from 'react';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Location icon

const UserDashboard = () => {
  const { city } = useSelector((state) => state.user);

  return (
    <div className="d-flex align-items-center">
      {city && (
        <span className="navbar-text me-3">
          <FaMapMarkerAlt className="me-1" /> {city}
        </span>
      )}
      {/* You can add other dashboard items like profile dropdown here */}
    </div>
  );
};

export default UserDashboard;