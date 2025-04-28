import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Signup from "./Signup.tsx";
import "bootstrap/dist/css/bootstrap.css";

createRoot(document.getElementById("Signup")!).render(
  <StrictMode>
    <Signup />
  </StrictMode>
);
