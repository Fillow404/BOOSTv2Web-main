import React, { useEffect } from "react";
import "./AboutUs.css";
import Header from "./Header.tsx";
import HeaderNav from "./LandingPageNavigation.tsx";
import ImageHeader from "../assets/Productivity.jpeg";
import Footer from "./Footer.tsx";
import ImageTeam1 from "../assets/Team1.jpg";
import Mascot from "../assets/Mascot.png";
import ImageTeam3 from "../assets/Team3.jpg";
import Location from "../assets/Location.png";
import zaldy from "../assets/Zaldy.png";
import sabado from "../assets/Sabado.png";
import baisa from "../assets/Baisa.png";

const CompanyOverview: React.FC = () => {
  useEffect(() => {
    // @ts-ignore to avoid TS error since AOS is global
    AOS.init({ duration: 1000 });
  }, []);

  const developers = [
    {
      name: "Zaldy Malig",
      role: "Full Stack Developer",
      img: zaldy,
    },
    {
      name: "John Luis Baisa",
      role: "Backend Developer",
      img: baisa,
    },
    {
      name: " Axel Kyle Sabado",
      role: "UI/UX Designer & Front-End Developer",
      img: sabado,
    },
    {
      name: "John Luis Dagsa",
      role: "Front-End Developer",
      img: "/images/dev4.jpg",
    },
    {
      name: "Ace Bignotia",
      role: "UI/UX Designer & Frond-End Developer",
      img: "/images/dev5.jpg",
    },
    {
      name: "Darwin Dimalanta ",
      role: "UI/UX Designer & Frond-End Developer",
      img: "/images/dev6.jpg",
    },
  ];

  return (
    <React.Fragment>
      <Header />
      <HeaderNav />
      <div className="overview-container">
        <div id="about-hero" data-aos="fade-in">
          <img src={ImageHeader} alt="About Us Banner" id="ImageHeader" />
          <div id="about-overlay">
            <h1 className=""> ABOUT US</h1>
          </div>
        </div>
        <div className="row mt-5 pt-5">
          <div className="col d-flex justify-content-center">
            <div className="row">
              <div className="Image-Container" data-aos="fade-up">
                <img src={ImageTeam1} id="ImageTeam" />
                <img src={ImageTeam3} id="ImageTeam" />
              </div>
            </div>
          </div>
          <div className="col-md-5 card" id="card" data-aos="fade-left">
            <h1
              className=" text-center fw-semibold mt-5 fw-bold text-warning"
              style={{ fontSize: "10vh" }}
              id="boost-tagline"
            >
              Bula
              <span id="color2">CAN</span> Boost
            </h1>
            <h6
              className="text-center text-success "
              id="boost-tagline"
              style={{ fontSize: "4vh" }}
            >
              "BOOST your way to productivity"
            </h6>
            <p>
              <strong>BulacanBoost Tech</strong> is a company focused on helping
              students and professionals become more productive through simple
              and easy-to-use digital tools. The word "Boost" reflects our goal
              to support users in their daily tasks, while "Tech" represents our
              commitment to creating modern, helpful solutions using technology.
              The name "Bulacan" is also a creative wordplay, showing that
              Bulacan can lead the way in improving productivity and creating
              positive change. Guided by our mission and vision, BulacanBoost
              Tech aims to develop accessible and meaningful tools that help
              people grow in school, work, and everyday life.
            </p>
          </div>
        </div>
        <div id="mascot-row" className="row mt-5 pt-5">
          <div
            id="mascot-info-col"
            className="col d-flex flex-column justify-content-center"
            data-aos="fade-right"
          >
            <h2 id="mascot-name">Meet BONI!</h2>
            <p id="mascot-description">
              BONI is the official mascot of <strong>Bulacan Boost</strong> — a
              cheerful and tech-savvy buddy here to inspire students and
              professionals to reach their full potential.
            </p>
            <p id="mascot-acronym">
              <strong>B.O.N.I</strong> stands for <strong>Boosting</strong>{" "}
              Opportunities, <strong>Navigating</strong> Innovation — a name
              that reflects our mission to empower, guide, and grow with you
              every step of the way.
            </p>
          </div>
          <div
            id="mascot-img-col"
            className="col d-flex justify-content-center align-items-center"
            data-aos="zoom-in"
          >
            <img
              src={Mascot}
              className="img-fluid rounded"
              style={{
                width: "60%",
                height: "auto",
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
            ></img>
          </div>
        </div>
        <div id="about-location" className="row pt-5 mt-5 align-items-center">
          <div
            id="location-img-col"
            className="col-md-6 text-center mb-4 mb-md-0"
            data-aos="fade-right"
          >
            <img
              src={Location}
              alt="Map Location"
              id="location-img"
              className="img-fluid rounded shadow"
            />
          </div>
          <div id="location-info-col" className="col-md-6" data-aos="fade-left">
            <h2 id="location-title" className="text-success fw-bold mb-3">
              Our Location
            </h2>
            <p id="location-description" className="fs-5">
              BulacanBoost Tech is proudly based in{" "}
              <strong>Bulacan, Philippines</strong> — a growing hub for
              innovation, education, and community leadership. We’re dedicated
              to serving students and professionals from all over, but our heart
              beats loudest here in Bulacan!
            </p>
          </div>
        </div>
        <h1 className="overview-title pt-5 mt-5 fw-bold">
          Vision, Mission & Core Values
        </h1>
        <p id="overview-subtitle" className="text-center text-muted mb-4">
          What we stand for and where we're headed
        </p>
        <h3></h3>
        <div className="row">
          <div className="col card  " data-aos="fade-up">
            {" "}
            <h2>Vision</h2>
            <p>
              To be a globally recognized platform that transforms student and
              professional productivity through collaborative, user-friendly
              solutions—enabling success, balance, and personal growth in a
              community dedicated to learning and excellence.
            </p>
          </div>
          <div className="col card " data-aos="fade-up" data-aos-delay="100">
            <h2>Mission</h2>
            <p>
              To make productivity accessible to all through intuitive,
              inclusive tools that inspire growth and efficiency. We build
              collaborative innovations that empower individuals to unlock their
              potential and thrive in dynamic environments—while supporting
              sustainability and lifelong development.
            </p>
          </div>

          <div className="col card " data-aos="fade-up" data-aos-delay="200">
            <h2>Core Values</h2>
            <p id="values-text">
              We value <strong>Innovation</strong>, embracing creativity and
              technology to design modern solutions;
              <strong>Collaboration</strong>, where teamwork and inclusivity
              shape everything we do;
              <strong>Accessibility</strong>, through simplicity, openness, and
              inclusiveness for all; and
              <strong>Excellence</strong>, with a commitment to integrity,
              growth, and long-term impact.
            </p>

            <p></p>
          </div>
        </div>

        <section className="pt-5 mt-5">
          <h2 className="text-center fw-bold mb-4" data-aos="fade-up">
            Meet the Team
          </h2>
          <p
            className="text-center text-muted fs-5 mb-5"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            At BulacanBoost Tech, our dedicated professionals bring together a
            rich blend of skills—from full stack development to user experience
            design. Each member is committed to driving innovation and
            delivering impactful solutions for students and professionals alike.
          </p>
          <div className="dev-team row justify-content-center">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="dev-card"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <img src={dev.img} alt={dev.name} className="dev-photo mb-3" />
                <h4 className="fw-semibold">{dev.name}</h4>
                <p className="text-muted">{dev.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </React.Fragment>
  );
};

export default CompanyOverview;
