import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 pt-4">

      {/* Top Divider Line */}
      <div className="container">
       
      </div>

      {/* Main Footer Content */}
      <div className="container pt-4 pb-5">
        <div className="row">

          {/* Brand + About */}
          <div className="col-md-3 mb-4">
            <h4 className="text-warning">FoodBowl</h4>
            <p className="small">
              We bring your cravings to your door — hot, fresh, and on time. Serving happiness, one order at a time.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#"><i className="fab fa-facebook-f text-light"></i></a>
              <a href="#"><i className="fab fa-twitter text-light"></i></a>
              <a href="#"><i className="fab fa-instagram text-light"></i></a>
              <a href="#"><i className="fab fa-linkedin-in text-light"></i></a>
            </div>
          </div>

          {/* Customer Links */}
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase">Customers</h6>
            <ul className="list-unstyled small">
              <li><a href="/menu" className="text-light">Menu</a></li>
              <li><a href="/offers" className="text-light">Offers</a></li>
              <li><a href="/login" className="text-light">Login</a></li>
              <li><a href="/signup" className="text-light">Sign Up</a></li>
              <li><a href="/help" className="text-light">Help</a></li>
            </ul>
          </div>

          {/* Partners */}
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase">Partners</h6>
            <ul className="list-unstyled small">
              <li><a href="/restaurant" className="text-light">Restaurant Signup</a></li>
              <li><a href="/delivery" className="text-light">Delivery Partner</a></li>
              <li><a href="/affiliate" className="text-light">Affiliate</a></li>
              <li><a href="/business" className="text-light">Business Enquiry</a></li>
            </ul>
          </div>

          {/* App Download */}
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase">Download App</h6>
            <div className="d-flex flex-column gap-2">
              <img src="/gogll.png" alt="Google Play" style={{ width: '40px',  height:'40px'}} />
              <img src="/new.png" alt="App Store" style={{ width: '40px', height:'40px'}} />
            </div>
          </div>

          {/* Contact */}
          <div className="col-md-3 mb-4">
            <h6 className="text-uppercase">Contact</h6>
            <p className="small mb-1"><i className="fas fa-phone-alt me-2"></i>+91 99999 99999</p>
            <p className="small mb-1"><i className="fas fa-envelope me-2"></i>support@foodiexpress.com</p>
            <p className="small"><i className="fas fa-map-marker-alt me-2"></i>Mumbai, India</p>
          </div>
        </div>
      </div>

      {/* Bottom Layer Content */}
      <div className="bg-secondary bg-opacity-10 py-4">
        <div className="container text-center small text-white">
          <div className="mb-2">
            <a href="/privacy" className="text-white me-3">Privacy Policy</a>
            <a href="/terms" className="text-white me-3">Terms of Service</a>
            <a href="/cookies" className="text-white">Cookie Policy</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} FoodieXpress Pvt. Ltd. | Built with ❤️ in India
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;