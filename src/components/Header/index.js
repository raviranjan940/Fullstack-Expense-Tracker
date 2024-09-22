import React, { useEffect } from "react";
import "./styles.css";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import userImg from "../../assets/user.svg";

function Header() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, loading]);

  const logoutFunc = () => {
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

  return (
    <div className="navbar">
      <p className="logo" onClick={logoClick}>
        Spendly.
      </p>
      {user && (
        <div style={{display: "flex", alignItems: "center", gap: "0.75rem"}}>
          <img 
            src={user.photoURL ? user.photoURL : userImg} 
            alt="profile"
            style={{borderRadius: "50%", height: "2rem", width: "2rem"}}
          />
          <p className="logo link" onClick={logoutFunc}>
            Logout
          </p>
        </div>
      )}
    </div>
  );
}

export default Header;
