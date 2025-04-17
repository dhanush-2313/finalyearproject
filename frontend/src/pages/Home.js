import { Link } from "react-router-dom"
import BlockchainStatus from "../components/BlockchainStatus/BlockchainStatus"
import AidRecords from "../components/AidRecords/AidRecords"
import "./Home.css"

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to AidForge</h1>
        <p>Securing humanitarian data with blockchain technology</p>
        <div className="home-actions">
          <Link to="/login" className="btn primary">
            Login
          </Link>
          <Link to="/signup" className="btn secondary">
            Sign Up
          </Link>
        </div>
      </header>

      <section className="home-features">
        <h2>Why Choose AidForge?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Secure Data</h3>
            <p>All humanitarian data is secured using blockchain technology, ensuring transparency and immutability.</p>
          </div>
          <div className="feature-item">
            <h3>Role-Based Access</h3>
            <p>Different access levels for administrators, donors, field workers, and refugees.</p>
          </div>
          <div className="feature-item">
            <h3>Transparent Donations</h3>
            <p>Track donations in real-time to ensure they reach the intended recipients.</p>
          </div>
        </div>
      </section>

      <section className="blockchain-section">
        <BlockchainStatus />
      </section>

      <section className="aid-records-section">
        <AidRecords />
      </section>
    </div>
  )
}

export default Home
