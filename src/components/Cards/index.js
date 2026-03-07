import React from "react";
import { TrendingUp, TrendingDown, Wallet, RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function Cards({income, expenses, totalBalance, showExpenseModal, showIncomeModal, showWarningModal}) {
  const balanceColor =
    totalBalance > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : totalBalance < 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Current Balance Card */}
        <Card className="relative overflow-hidden border-border/60 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className={`text-3xl font-bold tracking-tight ${balanceColor}`}>
              ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Net income minus expenses</p>
            <Button
              variant="outline"
              size="sm"
              onClick={showWarningModal}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive w-full"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Balance
            </Button>
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="relative overflow-hidden border-border/60 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              ₹{income.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total money received</p>
            <Button
              variant="income"
              size="sm"
              onClick={showIncomeModal}
              className="gap-2 w-full"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Income
            </Button>
          </CardContent>
        </Card>

        {/* Total Expenses Card */}
        <Card className="relative overflow-hidden border-border/60 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              ₹{expenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total money spent</p>
            <Button
              variant="expense"
              size="sm"
              onClick={showExpenseModal}
              className="gap-2 w-full"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Expense
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default Cards;
