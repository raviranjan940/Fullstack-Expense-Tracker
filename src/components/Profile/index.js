import React, { useEffect, useState } from "react";
import { Input, Button, Form, Modal } from "antd";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function ProfileModal({ isVisible, handleCancel, expenseTags, setExpenseTags, incomeTags, setIncomeTags }) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTags(); // Fetch tags when user is authenticated
    }
  }, [user]); // This effect will run when the user changes

  const fetchTags = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Log the fetched data for debugging
        console.log("Fetched user tags:", docSnap.data());

        setExpenseTags(docSnap.data().expenseTags || []); // Set fetched tags or fallback to empty array
        setIncomeTags(docSnap.data().incomeTags || []); // Set fetched tags or fallback to empty array
      } else {
        console.log("No tags found for this user.");
        setExpenseTags([]); // Fallback to empty array if no tags exist
        setIncomeTags([]); // Fallback to empty array if no tags exist
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load tags");
    }
    setLoading(false);
  };

  const saveTags = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        expenseTags: expenseTags,
        incomeTags: incomeTags,
      });
      toast.success("Tags updated successfully!");
      handleCancel();
    } catch (error) {
      console.error("Error saving tags:", error);
      toast.error("Failed to update tags");
    }
  };

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

  return (
    <Modal
      title="Manage Your Tags"
      visible={isVisible}
      onCancel={handleCancel}
      footer={null}  
    >
      <div className="form-container">
        <Form layout="vertical" onFinish={saveTags}>
          <Form.Item label="Expense Tags">
            <Input
              value={expenseTags?.join(", ")}
              onChange={(e) => setExpenseTags(e.target.value.split(",").map(tag => tag.trim()))}
              placeholder="Add expense tags (comma-separated)"
            />
          </Form.Item>

          <Form.Item label="Income Tags">
            <Input
              value={incomeTags?.join(", ")}
              onChange={(e) => setIncomeTags(e.target.value.split(",").map(tag => tag.trim()))}
              placeholder="Add income tags (comma-separated)"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Save Tags
          </Button>
        </Form>

        <Button type="default" onClick={logoutFunc} style={{ marginTop: "1rem" }}>
          Logout
        </Button>
      </div>
    </Modal>
  );
}

export default ProfileModal;
