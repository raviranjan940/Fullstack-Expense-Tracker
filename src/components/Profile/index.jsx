import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Tag, Loader2, Coins } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { CURRENCIES } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ProfileModal({ isVisible, handleCancel, expenseTags, setExpenseTags, incomeTags, setIncomeTags }) {
  const { user } = useUser();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState("");
  const [incomeDraft, setIncomeDraft] = useState("");

  const parseTags = (str) =>
    str.split(",").map((tag) => tag.trim()).filter(Boolean);

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
      const docRef = doc(db, "users", user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedExpenseTags = docSnap.data().expenseTags || [];
        const fetchedIncomeTags = docSnap.data().incomeTags || [];
        setExpenseTags(fetchedExpenseTags);
        setIncomeTags(fetchedIncomeTags);
        setExpenseDraft(fetchedExpenseTags.join(", "));
        setIncomeDraft(fetchedIncomeTags.join(", "));
      } else {
        setExpenseTags([]);
        setIncomeTags([]);
        setExpenseDraft("");
        setIncomeDraft("");
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
      const newExpenseTags = parseTags(expenseDraft);
      const newIncomeTags = parseTags(incomeDraft);
      const userRef = doc(db, "users", user.id);
      await setDoc(
        userRef,
        {
          expenseTags: newExpenseTags,
          incomeTags: newIncomeTags,
        },
        { merge: true }
      );
      setExpenseTags(newExpenseTags);
      setIncomeTags(newIncomeTags);
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
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your preferred currency and transaction tags.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Currency
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code} &mdash; {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Applies to all balances and transaction amounts.
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Expense Tags */}
          <div className="space-y-2">
            <Label htmlFor="expense-tags" className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
              Expense Tags
            </Label>
            <Input
              id="expense-tags"
              value={expenseDraft}
              onChange={(e) => setExpenseDraft(e.target.value)}
              placeholder="Food, Transport, Bills, Shopping"
            />
            {parseTags(expenseDraft).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parseTags(expenseDraft).map((tag) => (
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
              value={incomeDraft}
              onChange={(e) => setIncomeDraft(e.target.value)}
              placeholder="Salary, Freelance, Investment, Gift"
            />
            {parseTags(incomeDraft).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parseTags(incomeDraft).map((tag) => (
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
