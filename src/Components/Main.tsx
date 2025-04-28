import { Routes, Route } from "react-router-dom";
import Profile from "./Profile";
import SettingsTab from "./SettingsTab";

export default function App() {
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<SettingsTab />} />
    </Routes>
  );
}
