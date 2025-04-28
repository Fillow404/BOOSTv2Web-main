import { useState, useEffect } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";

import "./GeneralSetting.css";

export default function General() {
  const [date, setDate] = useState<string>(formatDate(new Date()));
  const [time, setTime] = useState<string>(formatTime(new Date()));
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [showDateInput, setShowDateInput] = useState<boolean>(false);
  const [showTimeInput, setShowTimeInput] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  function formatDate(dateObj: Date): string {
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(dateObj: Date): string {
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  useEffect(() => {
    if (autoUpdate) {
      getUserTimeZone();
      const interval = setInterval(() => {
        updateDateTime();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoUpdate]);

  const getUserTimeZone = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const URL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          fetch(URL)
            .then((res) => res.json())
            .then((_data) => {
              updateDateTime();
            })
            .catch((err) => console.error("Error fetching timezone:", err));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const updateDateTime = () => {
    const localDate = new Date();
    setDate(formatDate(localDate));
    setTime(formatTime(localDate));
  };

  return (
    <div className="container my-4">
      <div className="row d-flex flex-row justify-content-between align-items-start">
        {/* Date and Time Section */}
        <div className="col-md-6">
          <h4 className="mb-3">Date & Time Settings</h4>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span>Set Automatically</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={() => setAutoUpdate(!autoUpdate)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="mb-3 d-flex align-items-center justify-content-between">
            <strong>Date:</strong>
            {showDateInput && !autoUpdate ? (
              <input
                type="date"
                onChange={(e) => setDate(formatDate(new Date(e.target.value)))}
                disabled={autoUpdate}
                className="form-control w-50"
              />
            ) : (
              <span>{date}</span>
            )}
            <IoIosArrowForward
              className="ms-2 cursor-pointer"
              onClick={() => setShowDateInput(!showDateInput)}
            />
          </div>

          <div className="mb-3 d-flex align-items-center justify-content-between">
            <strong>Time:</strong>
            {showTimeInput && !autoUpdate ? (
              <input
                type="time"
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(":");
                  const dateObj = new Date();
                  dateObj.setHours(parseInt(hour), parseInt(minute));
                  setTime(formatTime(dateObj));
                }}
                disabled={autoUpdate}
                className="form-control w-50"
              />
            ) : (
              <span>{time}</span>
            )}
            <IoIosArrowForward
              className="ms-2 cursor-pointer"
              onClick={() => setShowTimeInput(!showTimeInput)}
            />
          </div>
        </div>

        {/* Feedback and Support Section */}
        <div className="col-md-5">
          <h4 className="mb-3">Feedback & Support</h4>
          <button
            className="btn btn-outline-primary w-100 mb-3"
            onClick={() => setShowFeedbackModal(true)}
          >
            Send Feedback
          </button>

          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => setShowHelpModal(true)}
          >
            <AiFillQuestionCircle className="me-2" />
            Help
          </button>

          {showFeedbackModal && (
            <div className="modal-backdrop">
              <div className="modal-box">
                <h5>Send us your Feedback</h5>
                <textarea
                  className="form-control my-2"
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Type your feedback here..."
                ></textarea>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      alert("Thank you for your feedback!");
                      setFeedbackText("");
                      setShowFeedbackModal(false);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {showHelpModal && (
            <div className="modal-backdrop">
              <div className="modal-box">
                <h5>Need Help?</h5>
                <p>For assistance or more information, please contact us:</p>
                <ul>
                  <li>Email: support@example.com</li>
                  <li>Phone: +63 912 345 6789</li>
                  <li>Facebook: /ourpage</li>
                </ul>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowHelpModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
