import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Content from "./Components/Contentland";
import SignUp from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard.tsx";
import Aboutus from "./Components/AboutUs.tsx";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Aboutus" element={<Aboutus />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
