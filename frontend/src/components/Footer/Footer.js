import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Contact us at <a href="mailto:support@aidforgeinnovations.org">support@aidforgeinnovations.org</a>
      </p>
      <p>&copy; {new Date().getFullYear()} AidForge. All Rights Reserved.</p>
      <ul className="footer-links">
        <li>
          <a href="/privacy-policy">Privacy Policy</a>
        </li>
        <li>
          <a href="/terms-of-service">Terms of Service</a>
        </li>
      </ul>
    </footer>
  )
}

export default Footer

