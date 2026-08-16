import React from "react";
import { TrendingUp, TrendingDown, Wallet, RefreshCw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/context/CurrencyContext";
import { getCurrency, formatNumber } from "@/lib/currency";

function Cards({income, expenses, totalBalance, showExpenseModal, showIncomeModal, showWarningModal}) {
  const { currency } = useCurrency();
  const currencySymbol = getCurrency(currency).symbol;
  const balanceColor =
    totalBalance > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : totalBalance < 0
      ? "text-rose-600 dark:text-rose-400"
      : "text-foreground";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Current Balance Card — the signature "statement stub" */}
        <Card className="relative overflow-hidden border-border/60 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute inset-x-0 top-0 border-t-2 border-dashed border-border/70" aria-hidden="true" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 relative">
            <CardTitle className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Current Balance
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-seal/15 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-seal" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3 ledger-ruled pt-3">
            <p className={`font-display text-4xl font-semibold tracking-tight tabular-nums ${balanceColor}`}>
              <span className="font-mono text-lg font-medium align-middle mr-1">{currencySymbol}</span>
              {formatNumber(totalBalance, currency)}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Net income minus expenses
            </p>
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
            <CardTitle className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Total Income
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className="font-display text-3xl font-semibold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
              <span className="font-mono text-base font-medium align-middle mr-1">{currencySymbol}</span>
              {formatNumber(income, currency)}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Total money received
            </p>
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
            <CardTitle className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Total Expenses
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="relative space-y-3">
            <p className="font-display text-3xl font-semibold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">
              <span className="font-mono text-base font-medium align-middle mr-1">{currencySymbol}</span>
              {formatNumber(expenses, currency)}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Total money spent
            </p>
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
