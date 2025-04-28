import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import "./Colab-tab.css";

const Pricing = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formValid, setFormValid] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleShowModal = (plan: string) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan("");
    setFormValid(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const allFilled = form.checkValidity();

    if (allFilled) {
      alert(`Successfully purchased the ${selectedPlan} plan!`);
      handleCloseModal();
    } else {
      setFormValid(false);
      form.reportValidity();
    }
  };

  const freeFeatures = ["To-Do List", "Pomodoro Timer", "Dashboard Tracker"];
  const premiumFeatures = [
    "To-Do List",
    "Pomodoro Timer",
    "Dashboard Tracker",
    "Brainstorming",
    "FlashCard",
    "Task Automation",
    "Cloud Synchronization",
    "Claimable Rewards (Spotify Premium, Canva Pro, Netflix)",
  ];

  return (
    <Container className="mt-5">
      <h2 className="display-4 text-center pb-3" id="pricing-header">
        Pricing Plans
      </h2>
      <p className="lead text-center pb-5">
        Choose the plan that suits your needs and take your productivity to the
        next level!
      </p>

      <Row className="justify-content-center">
        <Col md={3} className="mb-4">
          <Card id="pricing-free-plan" className="shadow-sm">
            <Card.Body>
              <Card.Title className="h4">Free Plan</Card.Title>
              <Card.Text className="text-muted">
                Ideal for getting started
              </Card.Text>
              <Card.Text>
                <strong>Included Features:</strong>
                <ul>
                  {freeFeatures.map((feature, index) => (
                    <li key={`free-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card id="pricing-monthly-premium" className="shadow-sm">
            <Card.Body>
              <Card.Title className="h4">Premium Plan - Monthly</Card.Title>
              <Card.Text className="text-muted">
                Get advanced features and productivity tools on a monthly basis.
              </Card.Text>
              <Card.Text>
                <strong>Price:</strong> ₱299/month
              </Card.Text>
              <Card.Text>
                <strong>Included Features:</strong>
                <ul>
                  {premiumFeatures.map((feature, index) => (
                    <li key={`monthly-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              </Card.Text>
              <Button
                variant="success"
                className="w-100"
                onClick={() => handleShowModal("Monthly")}
              >
                Upgrade to Premium
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card id="pricing-annual-premium" className="shadow-sm">
            <Card.Body>
              <Card.Title className="h4">Premium Plan - Annual</Card.Title>
              <Card.Text className="text-muted">
                Save on a yearly plan and access all premium features.
              </Card.Text>
              <Card.Text>
                <strong>Price:</strong> ₱2,999/year
              </Card.Text>
              <Card.Text>
                <strong>Included Features:</strong>
                <ul>
                  {premiumFeatures.map((feature, index) => (
                    <li key={`annual-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              </Card.Text>
              <Button
                variant="success"
                className="w-100"
                onClick={() => handleShowModal("Annual")}
              >
                Upgrade to Premium
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Purchase Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <div id="purchase-modal">
          <Modal.Header closeButton>
            <Modal.Title id="purchase-title">
              Upgrade to {selectedPlan} Plan
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="purchase-body">
            <p>
              You're choosing the <strong>{selectedPlan}</strong> Premium Plan.
              🎉
            </p>
            <p>Please enter your payment details to complete the purchase.</p>

            <form id="payment-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="card-name">Name on Card</label>
              <input
                type="text"
                id="card-name"
                placeholder="e.g. Jane Doe"
                required
              />

              <label htmlFor="card-number">Card Number</label>
              <input
                type="text"
                id="card-number"
                placeholder="1234 5678 9012 3456"
                required
              />

              <div id="payment-row">
                <div>
                  <label htmlFor="expiry">Expiry Date</label>
                  <input type="text" id="expiry" placeholder="MM/YY" required />
                </div>
                <div>
                  <label htmlFor="cvv">CVV</label>
                  <input type="password" id="cvv" placeholder="123" required />
                </div>
              </div>

              <div id="terms">
                <input type="checkbox" id="accept-terms" required />
                <label htmlFor="accept-terms">
                  I agree to the{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                  >
                    Terms and Conditions
                  </a>
                  .
                </label>
              </div>

              {!formValid && (
                <p id="error-message">
                  Please complete all fields and accept the terms.
                </p>
              )}

              <Button id="confirm-btn" type="submit">
                Confirm Purchase
              </Button>
            </form>
          </Modal.Body>
        </div>
      </Modal>

      {/* Terms and Conditions Modal */}
      <Modal
        show={showTermsModal}
        onHide={() => setShowTermsModal(false)}
        centered
      >
        <div id="terms-modal">
          <Modal.Header closeButton>
            <Modal.Title>Terms & Conditions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Welcome to our Premium Plan service! 🌱✨</p>
            <ul>
              <li>You agree to be charged automatically each period.</li>
              <li>No refunds are given for unused time after cancellation.</li>
              <li>We may update the feature list at any time.</li>
              <li>Do not misuse the system, or access may be revoked.</li>
              <li>Reach out to our friendly support for help anytime 💚</li>
            </ul>
            <p>Thanks for helping us grow together in productivity! 🌼</p>
          </Modal.Body>
        </div>
      </Modal>
    </Container>
  );
};

export default Pricing;
