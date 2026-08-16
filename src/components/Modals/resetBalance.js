import React from "react";
import { CSVLink } from "react-csv";
import { AlertTriangle, Download, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

function ResetWarningModal({ isVisible, handleCancel, handleConfirm, transactions }) {
  const headers = [
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
    { label: "Amount", key: "amount" },
    { label: "Tag", key: "tag" },
    { label: "Name", key: "name" },
  ];

  const sanitizeCsvCell = (value) => {
  const str = String(value ?? "");
  return /^[=+\-@]/.test(str) ? `'${str}` : str;
};

const csvData = transactions.map((transaction) => ({
    type: sanitizeCsvCell(transaction.type),
    date: sanitizeCsvCell(transaction.date),
    amount: transaction.amount,
    tag: sanitizeCsvCell(transaction.tag),
    name: sanitizeCsvCell(transaction.name),
  }));

  return (
    <AlertDialog open={isVisible} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reset All Transactions?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-sm">
            <p>
              This action will <strong>permanently delete</strong> all your transaction history from the database. This cannot be undone.
            </p>
            <p className="text-amber-600 dark:text-amber-400 font-medium">
              💡 We recommend exporting your data as CSV before proceeding.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 !justify-start">
          {/* Export CSV */}
          <CSVLink
            data={csvData}
            headers={headers}
            filename={"transactions_backup.csv"}
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full gap-2 border-amber-400/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20">
              <Download className="h-4 w-4" />
              Export Backup CSV
            </Button>
          </CSVLink>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Cancel */}
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            {/* Confirm Reset */}
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ResetWarningModal;
