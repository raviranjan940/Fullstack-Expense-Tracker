import React from 'react';
import {
  FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaWhatsapp, FaGlobe,
} from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { TrendingUp } from 'lucide-react';

const socialLinks = [
  { href: "https://x.com/RaviRanjan_940", icon: FaSquareXTwitter, label: "X (Twitter)" },
  { href: "https://www.instagram.com/raviranjan_143", icon: FaInstagram, label: "Instagram" },
  { href: "https://www.linkedin.com/in/raviranjan940/", icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/raviranjan940", icon: FaGithub, label: "GitHub" },
  { href: "https://www.facebook.com/profile.php?id=100013827531045", icon: FaFacebook, label: "Facebook" },
  { href: "https://raviranjan-940.netlify.app/", icon: FaGlobe, label: "Portfolio" },
];

const Footer = () => {
  const handleContactDeveloper = () => {
    window.open('https://wa.me/7479410130', '_blank');
  };

  return (
    <footer className="border-t border-border bg-card mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                Spendly<span className="text-primary">.</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your expenses with ease and take control of your finances.
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Contact</h3>
            <button
              onClick={handleContactDeveloper}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200"
            >
              <FaWhatsapp className="h-4 w-4" />
              Chat on WhatsApp
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Spendly — Proudly Made with ❤️ in India by{" "}
            <span className="font-medium text-foreground">Ravi Ranjan</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
