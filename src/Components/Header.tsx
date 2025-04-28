import React from "react";
import "./Header.css";

function Header() {
  return (
    <React.Fragment>
      <div
        className="row d-flex justify-content-center align-items-center"
        id="header"
      >
        <div className="col-12 text-center" id="Tagline">
          BOOST your way to productivity
        </div>
      </div>
    </React.Fragment>
  );
}

export default Header;
