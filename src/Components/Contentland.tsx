import React, { useState, useEffect } from "react";
import "./Contentland.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "/src/assets/LOGO.png";
import Video from "/src/assets/TeamworkLandingPage.mp4";
import Pomodoro from "/src/assets/Pomodoro.png";
import Todo from "/src/assets/Todolist.jpeg";
import Brainstorming from "/src/assets/Brainstorming.jpg";
import Tracker from "/src/assets/Tracker.jpeg";
import Reward from "/src/assets/Reward.png";
import Focus from "/src/assets/Focus.jpg";
import { Button, Modal } from "react-bootstrap";
import Header from "./Header";
import Nav from "./LandingPageNavigation";
import Footer from "./Footer.tsx";
import { useNavigate } from "react-router-dom";

function Contentland() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    description: "",
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const AboutUS = () => {
    navigate("/Aboutus");
  };
  useEffect(() => {
    // @ts-ignore to avoid TS error since AOS is global
    AOS.init({ duration: 1000, once: true });
  }, []);
  //https://chatgpt.com/share/680bd417-6f50-800a-88fc-68f4ec137162
  const handlePlay = () => {
    const video = document.getElementById("custom-video") as HTMLVideoElement;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleClose = () => setShowModal(false);
  const scrollToServices = () => {
    const element = document.getElementById("services-section");
    if (element) {
      const offset = 100;

      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  const handleShow = (title: string, description: string) => {
    setModalContent({ title, description });
    setShowModal(true);
  };

  return (
    <React.Fragment>
      <Header data-aos="fade-down" data-aos-delay="200" />
      <Nav data-aos="fade-down" data-aos-delay="300" />
      <h2
        className="text-center fw-semibold pt-5"
        id="boost-tagline"
        data-aos="fade-down"
        data-aos-delay="400"
      >
        <img
          className="img-fluid"
          src={Logo}
          alt="Logo"
          id="Logostart"
          data-aos="zoom-in"
          data-aos-delay="450"
        />
        <span id="color1">Unlock</span> Your Potential, Boost Yourself!
      </h2>

      <h4
        id="text1"
        className="text-center pb-1 medium-weight"
        data-aos="fade-up"
        data-aos-delay="500"
      >
        From Brainstorming to Focused Study
      </h4>

      <h6
        className="text-center pb-4"
        id="Unlock"
        data-aos="fade-up"
        data-aos-delay="550"
      >
        Unlock Your Full Potential.
      </h6>

      <div
        className="container"
        id="button-row"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <ul className="list-unstyled d-flex justify-content-center">
          <li className="btn p-3 m-1" id="abtus-btn" onClick={AboutUS}>
            About Us
          </li>
          <li className="btn p-3 m-1" id="serv-btn" onClick={scrollToServices}>
            Services
          </li>
        </ul>
      </div>

      <div
        className="video-container d-flex justify-self-center mt-5 pt-5"
        data-aos="zoom-in-up"
        data-aos-delay="700"
      >
        <video
          id="custom-video"
          className="video-player"
          src={Video}
          loop
          autoPlay
          onClick={handlePlay}
        ></video>

        {!isPlaying && (
          <button className="play-button" onClick={handlePlay}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="white"
              viewBox="0 0 16 16"
            >
              <path d="M6.271 4.055a.5.5 0 0 1 .759-.424l4.5 3.25a.5.5 0 0 1 0 .838l-4.5 3.25A.5.5 0 0 1 6 10.25v-6.5a.5.5 0 0 1 .271-.445z" />
            </svg>
          </button>
        )}
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="800">
        <div className="row">
          <div className="col-sm-1">
            <h2 className="fw-semibold">Benefits</h2>
          </div>
        </div>
        <div className="row" data-aos="fade-up" data-aos-delay="850">
          <div className="col-sm-12">
            Effective time management brings numerous benefits, enhancing
            productivity...
          </div>
        </div>

        <div className="row pt-5">
          {/** Each card has its own animation */}
          <div
            className="col-sm m-3 card"
            data-aos="fade-right"
            data-aos-delay="900"
          >
            <h1 className="fw-bold text-end p-4">01</h1>
            <h5>Focus on your work task</h5>
            <span className="pb-5">
              Fit your coursework around your existing commitments and
              obligations.
            </span>
          </div>
          <div
            className="col-sm m-3 card"
            data-aos="fade-up"
            data-aos-delay="950"
          >
            <h1 className="fw-bold text-end p-4">02</h1>
            <h5>Improve your productivity</h5>
            <span className="pb-5">
              Learn from industry experts who have hands-on experience in design
              and development.
            </span>
          </div>
          <div
            className="col-sm m-3 card"
            data-aos="fade-left"
            data-aos-delay="1000"
          >
            <h1 className="fw-bold text-end p-4">03</h1>
            <h5>Less Stress</h5>
            <span className="pb-5">
              Better organization and task management help you feel less
              overwhelmed and reduce stress levels.
            </span>
          </div>
        </div>

        <div className="row pt-2">
          <div
            className="col-sm m-3 card"
            data-aos="fade-right"
            data-aos-delay="1050"
          >
            <h1 className="fw-bold text-end p-4">04</h1>
            <h5>Quality of your work</h5>
            <span className="pb-5">
              Productivity tools often include features like automated reminders
              and version control.
            </span>
          </div>
          <div
            className="col-sm m-3 card"
            data-aos="fade-up"
            data-aos-delay="1100"
          >
            <h1 className="fw-bold text-end p-4">05</h1>
            <h5>Growth Opportunities</h5>
            <span className="pb-5">
              Many individuals are motivated by career growth and professional
              development opportunities.
            </span>
          </div>
          <div
            className="col-sm m-3 card"
            data-aos="fade-left"
            data-aos-delay="1150"
          >
            <h1 className="fw-bold text-end p-4">06</h1>
            <h5>Reduce Burnout</h5>
            <span className="pb-5">
              Spending the right amount of time on processes helps you better
              manage your workload.
            </span>
          </div>
        </div>

        <div
          className="row mb-5 mt-5 pt-5"
          data-aos="fade-up"
          data-aos-delay="1200"
        >
          <div className="row mb-2">
            <div className="col-lg">
              <h2 className="fw-semibold" id="services-section">
                Our Services
              </h2>
            </div>
          </div>

          <div className="col-sm-12">
            <span>
              At BulaCanBoost, we are committed to providing top-quality
              services tailored to your needs...
            </span>
          </div>
        </div>

        {/** Service Cards */}
        <div className="row d-flex justify-content-center">
          <div
            className="col-md-5 m-1 card"
            data-aos="zoom-in"
            data-aos-delay="1300"
          >
            <img
              src={Pomodoro}
              className="rounded mt-3"
              height={300}
              alt="Pomodoro Timer"
            />
            <h5 className="fw-semibold m-3">Pomodoro Timer</h5>
            <span className="px-3">
              A time management method based on 25-minute stretches...
            </span>
            <a
              className="btn m-2 mb-4"
              id="serv-btns"
              onClick={() => handleShow("Pomodoro Timer", "...")}
            >
              Know more!
            </a>
          </div>
          <div
            className="col-md-5 m-1 card"
            data-aos="zoom-in"
            data-aos-delay="1350"
          >
            <img
              src={Todo}
              className="rounded mt-3"
              height={300}
              alt="To-Do List"
            />
            <h5 className="fw-semibold m-3">To-Do List</h5>
            <span className="px-3">A list of things you have to do.</span>
            <a
              className="btn m-2 mb-4"
              id="serv-btns"
              onClick={() => handleShow("To-Do List", "...")}
            >
              Know more!
            </a>
          </div>
        </div>

        <div className="row d-flex justify-content-center">
          <div
            className="col-md-5 m-1 card"
            data-aos="zoom-in"
            data-aos-delay="1400"
          >
            <img
              src={Brainstorming}
              className="rounded mt-3"
              height={300}
              alt="Brainstorming"
            />
            <h5 className="fw-semibold m-3">Brainstorming</h5>
            <span className="px-3">
              A group problem-solving method involving creative ideas.
            </span>
            <a
              className="btn m-2 mb-4"
              id="serv-btns"
              onClick={() => handleShow("Brainstorming", "...")}
            >
              Know more!
            </a>
          </div>
          <div
            className="col-md-5 m-1 card"
            data-aos="zoom-in"
            data-aos-delay="1450"
          >
            <img
              src={Tracker}
              className="rounded mt-3"
              height={300}
              alt="Tracker"
            />
            <h5 className="fw-semibold m-3">Tracker</h5>
            <span className="px-3">
              Plan, prioritize, and track activities efficiently.
            </span>
            <a
              className="btn m-2 mb-4"
              id="serv-btns"
              onClick={() => handleShow("Tracker", "...")}
            >
              Know more!
            </a>
          </div>
        </div>

        <div className="row d-flex justify-content-center">
          <div
            className="col-md-5 m-1 card"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <img
              src={Reward}
              className="rounded mt-3"
              height={300}
              alt="Reward System"
            />
            <h5 className="fw-semibold m-3">EXP and Achievement</h5>
            <span className="px-3">
              A reward system encouraging task completion and productivity.
            </span>
            <a
              className="btn m-2 mb-4"
              id="serv-btns"
              onClick={() => handleShow("EXP and Achievement", "...")}
            >
              Know more!
            </a>
          </div>
          <div
            className="col-md-5 m-1 card"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <img
              src={Focus}
              className="rounded mt-3"
              height={300}
              alt="Focus Mode"
            />
            <h5 className="fw-semibold m-3">Focus Mode</h5>
            <span className="px-3">
              Block notifications and minimize distractions to stay focused.
            </span>
            <a
              className="btn m-2 mb-4"
              id="serv-btns"
              onClick={() => handleShow("Focus Mode", "...")}
            >
              Know more!
            </a>
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={handleClose}
        centered
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent.description}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer data-aos="fade-up" data-aos-delay="300" />
    </React.Fragment>
  );
}

export default Contentland;
