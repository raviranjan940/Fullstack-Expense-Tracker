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
      fetchTags();
    }
  }, [user]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExpenseTags(docSnap.data().expenseTags || []);
        setIncomeTags(docSnap.data().incomeTags || []);
      }
    } catch (error) {
      toast.error("Failed to load tags");
      console.error("Error fetching tags: ", error);
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
      handleCancel(); // Close the modal after saving
    } catch (error) {
      toast.error("Failed to update tags");
      console.error("Error updating tags: ", error);
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
      title="Profile - Edit Tags"
      visible={isVisible}
      onCancel={handleCancel}
      footer={null}  // We'll control the footer manually
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
