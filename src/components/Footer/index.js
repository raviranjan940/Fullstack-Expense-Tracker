import React from 'react';
import './styles.css';
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";

const Footer = () => {
  const handleContactDeveloper = () => {
    window.open('https://wa.me/7479410130', '_blank');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-branding">
            <h2>Spendly</h2>
            <p>Track your expenses with ease!</p>
          </div>
          <div className="footer-socials">
            <h3>Connect with us</h3>
            <div className="social-icons">
              <a href="https://x.com/RaviRanjan_940" target="_blank" rel="noopener noreferrer">
                <FaSquareXTwitter />
              </a>
              <a href="https://www.instagram.com/raviranjan_143" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/in/raviranjan940/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://github.com/raviranjan940" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100013827531045" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://raviranjan-940.netlify.app/" target="_blank" rel="noopener noreferrer">
                <FaGlobe />
              </a>
            </div>
          </div>
          <div className="footer-contact">
            <h3>Contact Developer</h3>
            <button onClick={handleContactDeveloper} className="whatsapp-button">
              <FaWhatsapp /> Chat on WhatsApp
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Spendly | Proudly Made with ❤️ in India by Ravi Ranjan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
