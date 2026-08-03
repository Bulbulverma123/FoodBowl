import React from "react";

const Developer = () => {
  return (
    <div className="">
         <hr className="border-secondary" />
    <div className="d-flex  align-items-center  gap-5 justify-content-center ">
      <div className="">
        <h6 className="text-success">Meet our Host</h6>
        <h1 className=" ">Mr  <br/>Gourav
        <br/>Verma
        </h1>
      </div>

      <div className=" ">
        <img
          src="/gourav.jpg"
          alt="host"
          className=""
          style={{ width: "150px", height: "180px", objectFit: "cover" , }}
        />
      </div>

      <div>
        <h6>Follow Gourav</h6>
        <ul className="list-inline d-flex gap-4">
          <li className="list-inline-item">
            <i className="fa-brands fa-facebook"></i>
          </li>
          <li className="list-inline-item">
            <i className="fa-brands fa-instagram"></i>
          </li>
          <li className="list-inline-item">
            <i className="fa-brands fa-linkedin"></i>
          </li>
        </ul>
        <h6>
          A dedicated Software Developer skilled in full-stack development,
          <br /> problem-solving, and creating high-quality applications.
          <br /> Passionate about turning ideas into reliable and
          <br /> impactful digital solutions.
        </h6>
        <p>
          When I first thought about this food delivery app,
          <br /> it wasn’t just about technology, it was about solving a simple
          struggle <br /> getting warm, delicious food when you need it <br />
          the most. Back in my college days, those late-night <br />
          hunger moments made me realize how powerful it would
          <br /> be to connect kitchens with people instantly. What
          <br /> started as a small thought has now grown
          <br /> into a journey – from hunger to happiness.&quot;
        </p>
      </div>
    </div>
    </div>
  );
};

export default Developer;