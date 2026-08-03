import React, { useState, useEffect, useRef } from "react";

const Carousal = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  const slides = [
    {
      id: 1,
      image: "/1.jpg",
      title: "Delicious Burger",
      description: "Fresh & Hot, just for you!",
      alt: "Burger"
    },
    {
      id: 2,
      image: "/2.jpg",
      title: "Cheesy Pizza",
      description: "Best in town, straight from the oven!",
      alt: "Pizza"
    },
    {
      id: 3,
      image: "/3.jpg",
      title: "Spicy Momos",
      description: "Street style, with love ❤️",
      alt: "Momos"
    },
    {
      id: 4,
      image: "/4.jpg",
      title: "Creamy Ice Cream",
      description: "Cool down your cravings 🍨",
      alt: "Ice Cream"
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prevSlide) => 
          prevSlide === slides.length - 1 ? 0 : prevSlide + 1
        );
      }, 3000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, slides.length]);

  // Handle manual navigation
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    const newSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(newSlide);
  };

  const goToNext = () => {
    const newSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    goToSlide(newSlide);
  };

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div 
      className="carousel slide position-relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ height: "40vh" }}
    >
      <div className="carousel-inner h-100">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item h-100 ${index === currentSlide ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              className="d-block w-100 h-100"
              style={{ objectFit: "cover" }}
              alt={slide.alt}
            />
            <div className="carousel-caption d-none d-md-block">
              <h1 className="text-white fw-bold">{slide.title}</h1>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Small Navigation Buttons */}
      <button
        className="btn btn-outline-light position-absolute top-50 start-0 translate-middle-y"
        type="button"
        onClick={goToPrevious}
        style={{
          zIndex: 10,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          marginLeft: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.8)",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(5px)"
        }}
      >
        <i className="fa-solid fa-chevron-left text-white"></i>
      </button>

      <button
        className="btn btn-outline-light position-absolute top-50 end-0 translate-middle-y"
        type="button"
        onClick={goToNext}
        style={{
          zIndex: 10,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          marginRight: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.8)",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(5px)"
        }}
      >
        <i className="fa-solid fa-chevron-right text-white"></i>
      </button>

      {/* Custom Small Dots Indicator */}
      <div 
        className="position-absolute bottom-0 start-50 translate-middle-x mb-3"
        style={{ zIndex: 10 }}
      >
        <div className="d-flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`btn btn-sm rounded-circle ${
                index === currentSlide 
                  ? 'btn-light' 
                  : 'btn-outline-light'
              }`}
              style={{
                width: "12px",
                height: "12px",
                padding: 0,
                border: "1px solid rgba(255,255,255,0.8)"
              }}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div 
          className="position-absolute top-0 end-0 m-3"
          style={{ zIndex: 10 }}
        >
          <div className="badge bg-success bg-opacity-75">
            <i className="fa-solid fa-play me-1"></i>
            Auto
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousal;