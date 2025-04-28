import { motion } from "framer-motion";
import "./TermsPolicy.css";

const TermsPolicy = ({ onClose }: { onClose: () => void }) => {
  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="terms-box"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <section
          style={{
            display: "flex",
            justifyContent: "starts",
          }}
        >
          <h1
            style={{
              fontSize: "35px",
              fontWeight: "700",
            }}
          >
            TERMS AND CONDITION
          </h1>
        </section>

        <section>
          <h2 className="Title">1. Introduction</h2>
          <p>
            Welcome to our platform! By accessing or using our services, you
            agree to comply with these Terms of Use and our Privacy Policy.
            Please read them carefully.
          </p>
          <h2 className="Title">2. Acceptance of Terms</h2>
          <p>
            By using our platform, you confirm that you accept these terms and
            agree to abide by them. If you do not agree, please refrain from
            using our services.
          </p>
        </section>

        <section>
          <h2 className="Title">3. User Responsibilities</h2>
          <p>
            You agree to use the platform lawfully and responsibly. You must not
            engage in any activity that violates applicable laws or infringes on
            the rights of others.
          </p>
        </section>

        <section>
          <h2 className="Title">4. Data Collection and Usage</h2>
          <p>
            We collect user data to improve our services and provide a better
            experience. This may include:
          </p>
          <ul>
            <li>
              Personal information you provide (e.g., name, email address)
            </li>
            <li>Usage data (e.g., interaction with our platform)</li>
          </ul>
          <p>
            We do not share your information with third parties without your
            explicit consent, except as required by law.
          </p>
        </section>

        <section>
          <h2 className="Title">5. Account Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials. Notify us immediately if you suspect
            unauthorized access to your account.
          </p>
        </section>

        <section>
          <h2 className="Title">6. Modifications to Terms</h2>
          <p>
            We may update these terms periodically. Continued use of the
            platform after changes indicates your acceptance of the revised
            terms.
          </p>
        </section>

        <section>
          <h2 className="Title">7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the
            platform if you violate these terms.
          </p>
        </section>

        <section>
          <h2 className="Title">8. Contact Us</h2>
          <p>
            If you have questions about these terms or our privacy practices,
            please contact us at [Insert Contact Information].
          </p>
        </section>
        <button onClick={onClose} className="close-btn">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TermsPolicy;
