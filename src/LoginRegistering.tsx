import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./Login.tsx";
import "bootstrap/dist/css/bootstrap.css";

createRoot(document.getElementById("login")!).render(
  <StrictMode>
    <Login />
  </StrictMode>
);
