import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Save, Tag, Loader2 } from "lucide-react";
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

  // Only fetch tags when the modal is OPENED — not on every user change.
  // This avoids the "Failed to load tags" error on the signup page where
  // setExpenseTags / setIncomeTags are not passed.
  useEffect(() => {
    if (isVisible && user && typeof setExpenseTags === "function") {
      fetchTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, user]);

  const fetchTags = async () => {
    if (!user || typeof setExpenseTags !== "function") return;
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
    if (!user || typeof setExpenseTags !== "function") return;
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
              value={expenseTags?.join(", ") || ""}
              onChange={(e) =>
                setExpenseTags && setExpenseTags(
                  e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)
                )
              }
              placeholder="Food, Transport, Bills, Shopping"
            />
            {expenseTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {expenseTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  >
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
              value={incomeTags?.join(", ") || ""}
              onChange={(e) =>
                setIncomeTags && setIncomeTags(
                  e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)
                )
              }
              placeholder="Salary, Freelance, Investment, Gift"
            />
            {incomeTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {incomeTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={saveTags}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Tags
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal;
