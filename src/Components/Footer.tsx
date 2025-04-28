import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="container mt-5 border-top pt-4">
      <div className="row">
        {/* Contact Section */}
        <div className="col-md-8">
          <div className="mb-3">
            <img
              src="/src/assets/BOOSTWORD.png"
              alt="Logo"
              style={{ width: "30%" }}
            />
          </div>
          <p>
            <strong>Email:</strong> BulaCanBoost@gmail.com
          </p>
          <p>
            <strong>Phone:</strong> +63 9510609840
          </p>
          <p>
            <strong>Address:</strong> Malolos, Bulacan
          </p>
        </div>

        {/* Social Profiles Section */}
        <div className="col-md-4 text-center">
          <h6>Social Profiles</h6>
          <div className="d-flex justify-content-center">
            <a
              href="#"
              className="me-3"
              aria-label="Facebook"
              style={{ fontSize: "1.5rem", color: "#64703E" }}
            >
              <FaFacebook />
            </a>
            <a
              href="#"
              className="me-3"
              aria-label="Twitter"
              style={{ fontSize: "1.5rem", color: "#64703E" }}
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              style={{ fontSize: "1.5rem", color: "#64703E" }}
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center mt-4">
        <p className="mb-0">© 2025 BOOST. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
