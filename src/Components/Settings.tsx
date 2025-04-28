import { useState } from "react";
import React from "react";
import GeneralSetting from "./GeneralSetting.tsx";
import LogSec from "./LoginSecurity.tsx";

export default function SettingsTab() {
  const [activeTab, setActiveTab] = useState("General");

  const menuItems = [
    {
      name: "General",
      component: <GeneralSetting />,
    },
    {
      name: "Login & Security",
      component: <LogSec />,
    },
  ];
  return (
    <React.Fragment>
      <div className="p-5">
        <h2>Settings</h2>
        <ul className="menu-list row border-bottom">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`menu-item col-sm-auto ms-4 ${
                activeTab === item.name ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              {item.name}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          {menuItems.find((item) => item.name === activeTab)?.component}
        </div>
      </div>
    </React.Fragment>
  );
}
