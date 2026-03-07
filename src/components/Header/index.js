import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { Sun, Moon, Tags, TrendingUp, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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

  const handleLogout = () => {
    try {
      signOut(auth)
        .then(() => {
          toast.success("Logged out successfully");
          navigate("/");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const logoClick = () => {
    window.open("https://www.satyalok.in", "_blank");
  };

  // Determine avatar image — Google photos need referrerPolicy
  const avatarSrc = user?.photoURL ? user.photoURL : userImg;

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

          {/* Right side */}
          <div className="flex items-center gap-2">

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

            {/* User Dropdown — only when logged in */}
            {user && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 border border-border hover:border-primary/40 hover:bg-muted/60 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                      aria-label="User menu"
                    >
                      {/* Avatar */}
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary/20">
                        <img
                          src={avatarSrc}
                          alt={user.displayName || "User"}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = userImg;
                          }}
                        />
                      </div>
                      {/* Name (hidden on very small screens) */}
                      <span className="hidden sm:block text-sm font-medium text-foreground max-w-[90px] truncate">
                        {user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Account"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    {/* User info header */}
                    <DropdownMenuLabel className="font-normal pb-0">
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-border flex-shrink-0">
                          <img
                            src={avatarSrc}
                            alt={user.displayName || "User"}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = userImg;
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {user.displayName || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* Manage Tags */}
                    <DropdownMenuItem
                      onClick={showProfileModal}
                      className="cursor-pointer text-foreground"
                    >
                      <Tags className="h-4 w-4 text-primary" />
                      Manage Tags
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile / Tags modal */}
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
