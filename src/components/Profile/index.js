import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { LogOut, Save, Tag, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function ProfileModal({ isVisible, handleCancel, expenseTags, setExpenseTags, incomeTags, setIncomeTags }) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExpenseTags(docSnap.data().expenseTags || []);
        setIncomeTags(docSnap.data().incomeTags || []);
      } else {
        setExpenseTags([]);
        setIncomeTags([]);
      }
    } catch (error) {
      toast.error("Failed to load tags");
    }
    setLoading(false);
  };

  const saveTags = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        expenseTags: expenseTags,
        incomeTags: incomeTags,
      });
      toast.success("Tags updated successfully!");
      handleCancel();
    } catch (error) {
      toast.error("Failed to update tags");
    }
    setLoading(false);
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
    <Dialog open={isVisible} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Manage Your Tags
          </DialogTitle>
          <DialogDescription>
            Add custom tags (comma-separated) for categorizing your transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Expense Tags */}
          <div className="space-y-2">
            <Label htmlFor="expense-tags" className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
              Expense Tags
            </Label>
            <Input
              id="expense-tags"
              value={expenseTags?.join(", ")}
              onChange={(e) =>
                setExpenseTags(e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))
              }
              placeholder="Food, Transport, Bills, Shopping"
            />
            {expenseTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {expenseTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Income Tags */}
          <div className="space-y-2">
            <Label htmlFor="income-tags" className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              Income Tags
            </Label>
            <Input
              id="income-tags"
              value={incomeTags?.join(", ")}
              onChange={(e) =>
                setIncomeTags(e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))
              }
              placeholder="Salary, Freelance, Investment, Gift"
            />
            {incomeTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {incomeTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted border border-border">
            <img
              src={user.photoURL || ""}
              alt="User"
              className="h-9 w-9 rounded-full object-cover border border-border"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 gap-2"
            onClick={saveTags}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Tags
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={logoutFunc}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal;
