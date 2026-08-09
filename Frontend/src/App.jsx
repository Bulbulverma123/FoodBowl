import React from "react";
import Home from "./screens/Home";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./screens/Login";
import About from "./screens/About";
import "./App.css";
import Menu from "./screens/Menu";
import Orders from "./screens/Orders";
import Cart from "./screens/Cart";
import Signup from "./Pages/Signup";
import Signin from "./Pages/Signin";
import Forgotpassword from "./Pages/Forgotpassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useSelector } from "react-redux";
import useGetCity from "./hooks/useGetCity";
import Location from "./screens/Location";
import OwnerDashboard from "./Components/OwnerDashboard";
import DeliveryBoy from "./Components/DeliveryBoy";
import DeliveryBoyDashboard from "./Components/DeliveryBoyDashboard";

// Smart server URL resolution: automatically uses Render backend in production/Vercel
export const serverUrl = (import.meta.env.VITE_SERVER_URL && !import.meta.env.VITE_SERVER_URL.includes("localhost"))
  ? import.meta.env.VITE_SERVER_URL
  : (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
      ? "https://foodbowl-x5es.onrender.com"
      : "http://localhost:8000");


const AppRoutes = () => {

  useGetCurrentUser();
  useGetCity();
  const { userData } = useSelector((state) => state.user);

  const getRedirectPath = () => {
    if (!userData) return "/";
    switch (userData.role) {
      case "owner":
        return "/owner-dashboard";
      case "deliveryBoy":
        return "/delivery-dashboard";
      default:
        return "/";
    }
  };

  return (
    <Routes>
      {/* Starting landing page visible to everyone */}
      <Route path="/" element={
        userData?.role === "owner" ? <Navigate to="/owner-dashboard" /> :
        userData?.role === "deliveryBoy" ? <Navigate to="/delivery-dashboard" /> :
        <Home />
      } />
      <Route path="/login" element={!userData ? <Login /> : <Navigate to={getRedirectPath()} />} />
      <Route path="/signup" element={!userData ? <Signup /> : <Navigate to={getRedirectPath()} />} />
      <Route path="/signin" element={!userData ? <Signin /> : <Navigate to={getRedirectPath()} />} />

      {/* Static pages sabke liye */}
      <Route path="/about" element={<About />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/location" element={<Location />} />
      <Route path="/forgot-password" element={<Forgotpassword />} />

      {/* Role-specific dashboards */}
      <Route path="/owner-dashboard" element={userData?.role === "owner" ? <OwnerDashboard /> : <Navigate to={getRedirectPath()} />} />
      <Route path="/delivery-dashboard" element={userData?.role === "deliveryBoy" ? <DeliveryBoyDashboard /> : <Navigate to={getRedirectPath()} />} />
    </Routes>
  );
};

const App = () => {
  // These hooks fetch data and update the redux store.
  // They run once when the App component mounts.
  useGetCurrentUser();
  useGetCity();

  return (
    <Router>
      <div>
        <AppRoutes />
      </div>
    </Router>
  );
};

export default App;
