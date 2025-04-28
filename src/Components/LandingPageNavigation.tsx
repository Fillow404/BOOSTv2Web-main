import { NavLink } from "react-router-dom";
import vectorImage from "../assets/LOGO.png";
import "./LandingPageNavigation.css";

function LandingNav() {
  return (
    <>
      <nav
        className="mx-2 py-3 row align-items-center justify-content-between"
        id="Nav"
      >
        <div className="col-auto">
          <NavLink to="/" className="text-decoration-none">
            <img
              className="p-2 img-fluid"
              src={vectorImage}
              id="Logo"
              alt="Logo"
            />
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="col-auto">
          <ul className="list-group list-group-horizontal d-flex align-items-center gap-2 m-0">
            <li className="btn px-3">
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? "text-decoration-none active-link"
                    : "text-decoration-none"
                }
                style={{
                  whiteSpace: "nowrap",
                }}
              >
                Sign-up
              </NavLink>
            </li>
            <li className="btn px-3">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "text-decoration-none active-link"
                    : "text-decoration-none"
                }
              >
                Log-in
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <hr className="mt-0 mb-0 ms-4 me-4" style={{ color: "wheat" }} />
    </>
  );
}

export default LandingNav;
