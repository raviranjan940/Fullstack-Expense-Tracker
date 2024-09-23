import React, { useEffect, useState } from "react";
import "./styles.css";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import userImg from "../../assets/user.svg";
import ProfileModal from "../Profile";
import { Button } from "antd";

function Header({expenseTags, incomeTags, setExpenseTags, setIncomeTags}) {
  const [user, loading] = useAuthState(auth);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const navigate = useNavigate();

  const showProfileModal = () => {
    setIsProfileModalVisible(true);
  };

  const handleProfileCancel = () => {
    setIsProfileModalVisible(false);
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

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
        <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
          <img 
            src={user.photoURL ? user.photoURL : userImg} 
            alt="profile"
            style={{borderRadius: "50%", height: "3rem", width: "3rem", cursor: "pointer"}}
            onClick={showProfileModal}
          />
          <ProfileModal
            expenseTags={expenseTags}
            incomeTags={incomeTags}
            setExpenseTags={setExpenseTags}
            setIncomeTags={setIncomeTags} 
            isVisible={isProfileModalVisible} 
            handleCancel={handleProfileCancel}
          />
          <button className="tag-btn" blue={true} onClick={showProfileModal}>
            Manage Tags
          </button>
        </div>
      )}
    </div>
  );
}

export default Header;
