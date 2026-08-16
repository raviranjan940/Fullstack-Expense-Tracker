import React, { useState } from "react";
import moment from "moment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { getCurrency } from "@/lib/currency";

function AddIncomeModal({ isIncomeModalVisible, handleIncomeCancel, onFinish, incomeTags }) {
  const { currency } = useCurrency();
  const currencySymbol = getCurrency(currency).symbol;
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !date || !tag) return;
    setLoading(true);
    const momentDate = moment(date, "YYYY-MM-DD");
    const values = { name, amount, date: momentDate, tag };
    onFinish(values, "income");
    setName(""); setAmount(""); setDate(""); setTag("");
    setLoading(false);
    handleIncomeCancel();
  };

  const handleClose = () => {
    setName(""); setAmount(""); setDate(""); setTag("");
    handleIncomeCancel();
  };

  return (
    <Dialog open={isIncomeModalVisible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-500" />
            Add Income
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="income-name">Transaction Name</Label>
            <Input
              id="income-name"
              type="text"
              placeholder="e.g. Monthly Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="income-amount">Amount ({currencySymbol})</Label>
            <Input
              id="income-amount"
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
            <Label htmlFor="income-date">Date</Label>
            <Input
              id="income-date"
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
                {incomeTags.length === 0 ? (
                  <SelectItem value="none" disabled>No tags yet — add in Manage Tags</SelectItem>
                ) : (
                  incomeTags.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="income" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddIncomeModal;