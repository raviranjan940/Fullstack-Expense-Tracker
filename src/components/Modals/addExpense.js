import React, { useState, useRef } from "react";
import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MinusCircle, Loader2 } from "lucide-react";

function AddExpenseModal({ isExpenseModalVisible, handleExpenseCancel, onFinish, expenseTags }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !date || !tag) return;
    setLoading(true);
    const momentDate = moment(date, "YYYY-MM-DD");
    const values = { name, amount, date: momentDate, tag };
    onFinish(values, "expense");
    setName(""); setAmount(""); setDate(""); setTag("");
    setLoading(false);
    handleExpenseCancel();
  };

  const handleClose = () => {
    setName(""); setAmount(""); setDate(""); setTag("");
    handleExpenseCancel();
  };

  return (
    <Dialog open={isExpenseModalVisible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MinusCircle className="h-5 w-5 text-rose-500" />
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="expense-name">Transaction Name</Label>
            <Input
              id="expense-name"
              type="text"
              placeholder="e.g. Grocery shopping"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount (₹)</Label>
            <Input
              id="expense-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Tag */}
          <div className="space-y-2">
            <Label>Category Tag</Label>
            <Select value={tag} onValueChange={setTag} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {expenseTags.length === 0 ? (
                  <SelectItem value="none" disabled>No tags yet — add in Manage Tags</SelectItem>
                ) : (
                  expenseTags.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="expense" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddExpenseModal;