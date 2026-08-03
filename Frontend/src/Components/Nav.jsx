import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // axios import missing tha
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

const Navbar = ({ setSearch }) => {
  const { userData, city } = useSelector((state) => state.user);
  const { totalItems } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className=" navbar navbar-expand-lg navbar-dark bg-success  ">
      <div className="container-fluid ">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse d-flex justify-content-between align-items-center" id="navbarNav">
          {/* 🟢 Left-side nav items - visible only for users */}
          {userData && userData.role === "user" && (
            <ul
              className="navbar-nav d-flex align-items-center"
              style={{ gap: "25px" }}
            >
              <li className="nav-item">
                <Link className="nav-link active" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Menu">
                  Menu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Orders">
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/About">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link d-flex align-items-center"
                  to="/location"
                  style={{ gap: "5px" }}
                >
                  <i className="fa-solid fa-location-dot"></i>
                  {/* Show the city name if available, otherwise show "Location" */}
                  {city}
                </Link>
              </li>
            </ul>
          )}

          {/* Center: Logo - always visible and centered */}
          <Link
            className="navbar-brand d-flex align-items-center fs-2 mx-auto"
            to="/"
            style={{ gap: "8px" }}
          >
            <img
              src="/logoburger.png"
              style={{ height: "50px" }}
              alt="logo"
            />
            <span
              style={{
                fontFamily: "initial",
                fontWeight: "bold",
                fontSize: "1.75rem",
              }}
            >
              <span style={{ color: "#fefefec0" }}>Food</span>
              <span style={{ color: "#ffdd00aa" }}>Bowl</span>
            </span>
          </Link>

          {/* Right: Search and Login/Logout */}
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            {/* Conditionally render the search bar only if setSearch is provided */}
            {setSearch && userData && userData.role === "user" && (
              <form className="d-flex" style={{ gap: "1px" }} onSubmit={(e) => e.preventDefault()}>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search..."
                  aria-label="Search"
                  onChange={(e) => setSearch(e.target.value)}
                />
                {/* Cart button - should be a link */}
                <Link to="/cart" className="btn btn-light position-relative">
                  <i className="fa-solid fa-cart-shopping"></i>
                  {totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </form>
            )}
            {/* Conditionally render Login or Logout button */}
            {userData ? (
              <button
                className="btn btn-outline-light"
                onClick={() => {
                  dispatch(setUserData(null)); // Clear user data
                  navigate("/login");
                }}
              >
                Logout
              </button>
            ) : (
              <Link className="btn btn-light" to="/signin">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;