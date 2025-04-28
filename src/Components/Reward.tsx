import React, { useEffect, useRef, useState } from "react";
import "./Reward.css";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  SiNetflix,
  SiSpotify,
  SiCanva,
  SiDiscord,
  SiScribd,
  SiYoutube,
  SiGrammarly,
  SiValorant,
  SiRoblox,
} from "react-icons/si";

export default function Reward() {
  const [userXp, setUserXp] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [claimingReward, setClaimingReward] = useState<{
    name: string;
    xp: number;
  } | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserXp = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserXp(userData.exp || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching user XP:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserXp();
  }, []);

  const handleClaim = async (rewardXp: number, rewardName: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const newXp = userXp - rewardXp;
        await updateDoc(userDocRef, { exp: newXp });
        setUserXp(newXp);
        setModalMessage(`You have successfully claimed ${rewardName}!`);
        setShowClaimModal(true);
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setModalMessage("An error occurred while claiming the reward.");
      setShowClaimModal(true);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingReward || !acceptedTerms) return;

    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const address = addressRef.current?.value || "";

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();

      if (user) {
        await addDoc(collection(db, "rewards"), {
          userId: user.uid,
          rewardName: claimingReward.name,
          xpSpent: claimingReward.xp,
          name,
          email,
          address,
          claimedAt: new Date(),
        });

        await handleClaim(claimingReward.xp, claimingReward.name);
        setClaimingReward(null);
        setAcceptedTerms(false);
      }
    } catch (error) {
      console.error("Error submitting reward form:", error);
      setModalMessage("Failed to submit reward. Please try again.");
      setShowClaimModal(true);
    }
  };

  const rewards = [
    {
      name: "Spotify Premium",
      icon: <SiSpotify size={100} />,
      xpRequired: 15000,
    },
    { name: "Netflix", icon: <SiNetflix size={100} />, xpRequired: 100000 },
    { name: "Canva Pro", icon: <SiCanva size={100} />, xpRequired: 12000 },
    {
      name: "Discord Nitro",
      icon: <SiDiscord size={100} />,
      xpRequired: 16000,
    },
    {
      name: "Scribd Subscription",
      icon: <SiScribd size={100} />,
      xpRequired: 18000,
    },
    {
      name: "YouTube Premium",
      icon: <SiYoutube size={100} />,
      xpRequired: 13000,
    },
    {
      name: "Grammarly Pro",
      icon: <SiGrammarly size={100} />,
      xpRequired: 12000,
    },
    {
      name: "Valorant Points",
      icon: <SiValorant size={100} />,
      xpRequired: 25000,
    },
    { name: "Robux", icon: <SiRoblox size={100} />, xpRequired: 40000 },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <React.Fragment>
      <div className="flex flex-col items-center justify-center h-screen">
        <div id="reward-container">
          <h1 id="reward-title">Rewards</h1>
          <p id="user-xp">Your Total XP: {userXp.toLocaleString()} XP</p>
          <div id="rewards-grid">
            {rewards.map((reward, index) => (
              <div id="reward-card" key={index}>
                <div id="icon-wrapper">{reward.icon}</div>
                <div id="reward-name">{reward.name}</div>
                <div id="xp-required">
                  {reward.xpRequired.toLocaleString()} XP Required
                </div>
                <progress value={userXp} max={reward.xpRequired}></progress>
                <div id="xp-stats">
                  {userXp.toLocaleString()} /{" "}
                  {reward.xpRequired.toLocaleString()} XP
                </div>
                <button
                  id="claim-btn"
                  disabled={userXp < reward.xpRequired}
                  onClick={() =>
                    setClaimingReward({
                      name: reward.name,
                      xp: reward.xpRequired,
                    })
                  }
                >
                  {userXp >= reward.xpRequired ? "Claim" : "Insufficient XP"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {claimingReward && (
        <div id="modal-bg">
          <div id="modal-content">
            <h3>Claim {claimingReward.name}</h3>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                ref={nameRef}
                placeholder="Full Name"
                id="claim-name"
                required
              />
              <input
                type="email"
                ref={emailRef}
                placeholder="Email Address"
                id="claim-email"
                required
              />
              <input
                type="text"
                ref={addressRef}
                placeholder="Delivery Address / Account ID"
                id="claim-address"
                required
              />
              <div>
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <label htmlFor="accept-terms">
                  I accept the{" "}
                  <button type="button" onClick={() => setShowTermsModal(true)}>
                    Terms & Conditions
                  </button>
                </label>
              </div>
              <div>
                <button
                  id="submit-claim"
                  type="submit"
                  disabled={!acceptedTerms}
                >
                  Submit & Claim
                </button>
                <button
                  id="cancel-claim"
                  type="button"
                  onClick={() => {
                    setClaimingReward(null);
                    setAcceptedTerms(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showClaimModal && (
        <div className="modal-bg">
          <div className="modal-content bg-light p-4 rounded-5">
            <h3>Reward Claimed</h3>
            <p>{modalMessage}</p>
            <div className="modal-buttons">
              <button
                onClick={() => setShowClaimModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-bg">
          <div className="modal-content bg-light p-4 rounded-5 max-w-md">
            <h3>Terms & Conditions</h3>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                textAlign: "left",
              }}
            >
              <p>
                By claiming this reward, you agree to provide accurate
                information. False submissions may result in account suspension.
                You also consent to us storing your data for the purpose of
                reward fulfillment. Rewards may take up to 7 business days for
                processing.
              </p>
              <p>
                All claims are final and subject to manual verification. Abuse
                of the system will lead to disqualification from future claims.
              </p>
              <p>
                For more details, contact our support. These terms may be
                updated at any time without notice.
              </p>
            </div>
            <div className="modal-buttons mt-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
