import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Tags, TrendingUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/button";
import ProfileModal from "../Profile";
import userImg from "../../assets/user.svg";

function Header({ expenseTags, incomeTags, setExpenseTags, setIncomeTags }) {
  const [user, loading] = useAuthState(auth);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const showProfileModal = () => setIsProfileModalVisible(true);
  const handleProfileCancel = () => setIsProfileModalVisible(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const logoClick = () => {
    window.open("https://www.satyalok.in", "_blank");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={logoClick}
            className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-primary/40 transition-shadow">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span>
              Spendly<span className="text-primary font-extrabold">.</span>
            </span>
          </button>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-foreground" />
              )}
            </Button>

            {/* User Controls */}
            {user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showProfileModal}
                  className="gap-2 hidden sm:flex"
                >
                  <Tags className="h-4 w-4" />
                  Manage Tags
                </Button>

                <button
                  onClick={showProfileModal}
                  className="relative rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label="User profile"
                >
                  <img
                    src={user.photoURL ? user.photoURL : userImg}
                    alt="profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                </button>

                <ProfileModal
                  expenseTags={expenseTags}
                  incomeTags={incomeTags}
                  setExpenseTags={setExpenseTags}
                  setIncomeTags={setIncomeTags}
                  isVisible={isProfileModalVisible}
                  handleCancel={handleProfileCancel}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
