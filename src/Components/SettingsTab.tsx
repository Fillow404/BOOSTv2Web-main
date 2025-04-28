import { Routes, Route, useNavigate } from "react-router-dom";
import GeneralSetting from "./GeneralSetting.tsx";
import LogSec from "./LoginSecurity.tsx";

export default function SettingsTab() {
  const navigate = useNavigate();

  const menuItems = [
    { name: "General", path: "/settings/general" },
    { name: "Personal Info", path: "/settings/personal" },
    { name: "Login & Security", path: "/settings/login-security" },
  ];

  return (
    <div className="p-5">
      <h2>Settings</h2>
      <ul className="menu-list row border-bottom">
        {menuItems.map((item) => (
          <li
            key={item.name}
            className="menu-item col-sm-auto ms-4 clickable"
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <Routes>
          <Route path="general" element={<GeneralSetting />} />
          <Route path="login-security" element={<LogSec />} />
        </Routes>
      </div>
    </div>
  );
}
