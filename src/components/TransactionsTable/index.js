import React, { useState, useEffect } from "react";
import moment from "moment";
import { parse, unparse } from "papaparse";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Pencil, Trash2, Search, Upload, Download, FileText,
  ArrowUpDown, CalendarRange, Tag, Filter, X, Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "../ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "../ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const ROWS_PER_PAGE = 10;


function TransactionsTable({
  transactions, addTransaction, updateTransaction, deleteTransaction,
  fetchTransactions, incomeTags, expenseTags,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Export states
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("");

  // Logo preference states
  const [isLogoPreferenceModalVisible, setIsLogoPreferenceModalVisible] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Edit states
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editType, setEditType] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete states
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters / sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, sortKey, selectedTag, startDate, endDate]);

  // CSV Import
  async function importFromCsv(event) {
    event.preventDefault();
    try {
      const file = event.target.files[0];
      if (!file) { toast.error("No file selected"); return; }
      parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            if (transaction.Name && transaction.Type && transaction.Date && transaction.Tag && transaction.Amount) {
              const parsedDate = moment(transaction.Date, ["DD-MM-YYYY", "YYYY-MM-DD"], true);
              if (!parsedDate.isValid()) {
                toast.error(`Invalid date for "${transaction.Name}". Expected DD-MM-YYYY.`);
                continue;
              }
              const newTransaction = {
                name: transaction.Name, type: transaction.Type,
                date: parsedDate.format("DD-MM-YYYY"),
                tag: transaction.Tag, amount: parseFloat(transaction.Amount),
              };
              await addTransaction(newTransaction, true);
            }
          }
          toast.success("All valid Transactions Added");
          await fetchTransactions();
          event.target.files = null;
        },
        error: (error) => toast.error(`Error parsing CSV: ${error.message}`),
      });
    } catch (e) { toast.error(e.message); }
  }

  // Filter & Sort
  const filteredTransactions = transactions.filter((t) => {
    const searchMatch = search ? t.name.toLowerCase().includes(search.toLowerCase()) : true;
    const tagMatch = selectedTag && selectedTag !== "all" ? t.tag === selectedTag : true;
    const typeMatch = typeFilter && typeFilter !== "all" ? t.type === typeFilter : true;
    const tDate = t.date ? moment(t.date, "DD-MM-YYYY").toDate() : new Date();
    const startMatch = startDate ? tDate >= new Date(startDate) : true;
    const endMatch = endDate ? tDate <= new Date(endDate + "T23:59:59") : true;
    return searchMatch && tagMatch && typeMatch && startMatch && endMatch;
  });

  let sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return moment(a.date, "DD-MM-YYYY").toDate() - moment(b.date, "DD-MM-YYYY").toDate();
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / ROWS_PER_PAGE));
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // Build visible page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 4) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // Open Edit Modal
  const openEditModal = (transaction) => {
    const parsedDate = transaction.date
      ? moment(transaction.date, ["DD-MM-YYYY", "YYYY-MM-DD"], true)
      : null;
    if (transaction.date && parsedDate && !parsedDate.isValid()) {
      toast.error(`Invalid date for "${transaction.name}".`);
      return;
    }
    setEditingTransaction(transaction);
    setEditName(transaction.name);
    setEditAmount(transaction.amount);
    setEditDate(parsedDate ? parsedDate.format("YYYY-MM-DD") : "");
    setEditTag(transaction.tag);
    setEditType(transaction.type);
    setIsEditModalVisible(true);
  };

  const handleEdit = async () => {
    if (!editName || !editAmount || !editDate || !editTag || !editType) {
      toast.error("Please fill all fields"); return;
    }
    setEditLoading(true);
    const updatedTransaction = {
      ...editingTransaction,
      name: editName,
      amount: parseFloat(editAmount),
      tag: editTag,
      type: editType,
      date: moment(editDate, "YYYY-MM-DD").format("DD-MM-YYYY"),
    };
    await updateTransaction(updatedTransaction);
    setIsEditModalVisible(false);
    setEditingTransaction(null);
    setEditLoading(false);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
  };

  // Delete
  const openDeleteModal = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete.id);
      setIsDeleteModalVisible(false);
      setTransactionToDelete(null);
    }
  };

  // Export
  function showExportModal(format) {
    setExportFormat(format);
    if (format === "pdf") {
      setIsLogoPreferenceModalVisible(true);
    } else {
      setIsExportModalVisible(true);
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size / 1024 / 1024 > 2) { toast.error("Image must be smaller than 2MB"); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setLogoPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogoPreferenceConfirm = () => {
    if (includeLogo && !logoFile) { toast.error("Please upload a logo first"); return; }
    setIsLogoPreferenceModalVisible(false);
    setIsExportModalVisible(true);
  };

  const handleLogoPreferenceCancel = () => {
    setIsLogoPreferenceModalVisible(false);
    setIncludeLogo(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  function handleExport() {
    const filteredData =
      exportType === "all"
        ? sortedTransactions
        : sortedTransactions.filter((t) => t.type === exportType);

    const incomeTotal = filteredData.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenseTotal = filteredData.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    if (exportFormat === "csv") {
      const csvData = filteredData.map(({ name, type, date, tag, amount }) => [name, type, date, tag, amount]);
      const csv = unparse({ fields: ["Name", "Type", "Date", "Tag", "Amount"], data: csvData });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "your_transactions_report.csv";
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } else if (exportFormat === "pdf") {
      const doc = new jsPDF();
      let yPosition = 20;

      const addPdfContent = () => {
        doc.setFontSize(18);
        doc.text("Transactions Report", doc.internal.pageSize.width / 2, yPosition, { align: "center" });
        yPosition += 10;
        const tableColumn = ["Name", "Amount", "Tag", "Type", "Date"];
        const tableRows = filteredData.map((t) => [
          t.name, `Rs ${t.amount.toFixed(2)}`, t.tag,
          t.type.charAt(0).toUpperCase() + t.type.slice(1), t.date,
        ]);
        doc.autoTable({
          startY: yPosition, head: [tableColumn], body: tableRows,
          margin: { top: 10 }, theme: "striped", styles: { fontSize: 10 },
          columnStyles: { 1: { halign: "right" } },
          headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          tableWidth: "auto", showHead: "everyPage", pageBreak: "auto",
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10); doc.setTextColor(150);
            doc.text(
              "Page " + doc.internal.getCurrentPageInfo().pageNumber + " of " + pageCount,
              doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" }
            );
          },
        });
        let finalY = (doc.lastAutoTable?.finalY || yPosition) + 20;
        if (finalY > doc.internal.pageSize.height - 60) { doc.addPage(); finalY = 20; }
        doc.setFontSize(14); doc.setTextColor(99, 102, 241); doc.setFont(undefined, "bold");
        doc.text("Financial Summary", 14, finalY); finalY += 10;
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5);
        doc.line(14, finalY, doc.internal.pageSize.width - 14, finalY); finalY += 10;
        doc.setTextColor(0, 0, 0); doc.setFont(undefined, "normal"); doc.setFontSize(12);
        doc.setTextColor(0, 128, 0); doc.text("Total Income:", 14, finalY);
        doc.text(`Rs ${incomeTotal.toFixed(2)}`, doc.internal.pageSize.width - 14, finalY, { align: "right" }); finalY += 8;
        doc.setTextColor(255, 0, 0); doc.text("Total Expense:", 14, finalY);
        doc.text(`Rs ${expenseTotal.toFixed(2)}`, doc.internal.pageSize.width - 14, finalY, { align: "right" }); finalY += 8;
        doc.setTextColor(99, 102, 241); doc.setFont(undefined, "bold");
        doc.text("Available Amount:", 14, finalY);
        doc.text(`Rs ${(incomeTotal - expenseTotal).toFixed(2)}`, doc.internal.pageSize.width - 14, finalY, { align: "right" });
        doc.setDrawColor(99, 102, 241); doc.setLineWidth(0.3);
        doc.rect(10, finalY - 25, doc.internal.pageSize.width - 20, 35);
        doc.save("your_transactions_report.pdf");
      };

      if (includeLogo && logoFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            doc.addImage(event.target.result, "JPEG", (doc.internal.pageSize.width - 80) / 2, 15, 80, 20);
            yPosition = 45;
          } catch (e) { console.log("Logo error:", e); }
          addPdfContent();
        };
        reader.readAsDataURL(logoFile);
      } else {
        addPdfContent();
      }
    }
    setIsExportModalVisible(false);
  }

  const allTags = [...new Set([...incomeTags, ...expenseTags])];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      {/* Main Table Card */}
      <Card className="overflow-hidden shadow-md">
        {/* Card Header / Controls */}
        <CardHeader className="border-b border-border pb-0 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">My Transactions</CardTitle>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted">
              {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Search & Tag Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                placeholder="Search by name..."
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-40">
                <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort & Date Range Row */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {/* Sort Buttons */}
            <div className="flex gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
              {[
                { key: "", label: "No Sort" },
                { key: "date", label: "By Date" },
                { key: "amount", label: "By Amount" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    sortKey === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  }`}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 text-sm"
                  placeholder="Start Date"
                />
              </div>
              <div className="relative flex-1">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 text-sm"
                  placeholder="End Date"
                />
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Export & Import Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => showExportModal("csv")} className="gap-2">
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => showExportModal("pdf")} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <label
              htmlFor="file-csv"
              className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </label>
            <input
              onChange={importFromCsv}
              id="file-csv"
              type="file"
              accept=".csv"
              required
              style={{ display: "none" }}
            />
          </div>

          {/* bottom spacing inside CardHeader */}
          <div className="pb-2" />
        </CardHeader>

        {/* Table in CardContent */}
        <CardContent className="p-0">
        {/* Table */}
        {sortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <FileText className="h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs">Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="group">
                  <TableCell className="font-medium text-foreground">{transaction.name}</TableCell>
                  <TableCell className={transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
                    {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {transaction.tag}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "income" : "expense"}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{transaction.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(transaction)}
                        title="Edit Transaction"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(transaction)}
                        title="Delete Transaction"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* ─── Pagination Bar ─── */}
        {totalPages > 1 && (
          <div className="border-t border-border px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Row summary */}
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing{" "}
              <span className="font-medium text-foreground">
                {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, sortedTransactions.length)}
              </span>
              {"–"}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * ROWS_PER_PAGE, sortedTransactions.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{sortedTransactions.length}</span>{" "}
              transactions
            </p>

            {/* Page links */}
            <Pagination className="order-1 sm:order-2 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        </CardContent>
      </Card>

      {/* ─── Edit Dialog ─── */}
      <Dialog open={isEditModalVisible} onOpenChange={(open) => !open && handleEditCancel()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Transaction name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (₹)</Label>
              <Input id="edit-amount" type="number" min="0" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={editTag} onValueChange={setEditTag}>
                <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
                <SelectContent>
                  {incomeTags.map((tag) => <SelectItem key={`i-${tag}`} value={tag}>{tag}</SelectItem>)}
                  {expenseTags.map((tag) => <SelectItem key={`e-${tag}`} value={tag}>{tag}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editLoading} className="gap-2">
              {editLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={isDeleteModalVisible} onOpenChange={(open) => !open && setIsDeleteModalVisible(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">"{transactionToDelete?.name}"</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalVisible(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Logo Preference Modal (PDF) ─── */}
      <Dialog open={isLogoPreferenceModalVisible} onOpenChange={(open) => !open && handleLogoPreferenceCancel()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> PDF Export Options
            </DialogTitle>
            <DialogDescription>Configure your PDF report before exporting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Include logo in PDF</span>
            </label>

            {includeLogo && (
              <div className="space-y-3">
                <Label htmlFor="logo-upload">Upload Logo (max 2MB)</Label>
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Click to upload (JPG, PNG)</span>
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {logoPreview && (
                  <div className="flex justify-center p-3 border border-dashed border-border rounded-lg">
                    <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-16 object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLogoPreferenceCancel}>Cancel</Button>
            <Button onClick={handleLogoPreferenceConfirm} className="gap-2">
              <FileText className="h-4 w-4" /> Continue to Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Export Type Modal ─── */}
      <Dialog open={isExportModalVisible} onOpenChange={(open) => !open && setIsExportModalVisible(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {exportFormat === "csv" ? <FileText className="h-5 w-5 text-primary" /> : <Download className="h-5 w-5 text-primary" />}
              Export {exportFormat?.toUpperCase()}
            </DialogTitle>
            <DialogDescription>Select which transactions to include in the export.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {[
              { value: "all", label: "All Transactions" },
              { value: "income", label: "Income Only" },
              { value: "expense", label: "Expense Only" },
            ].map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  exportType === value ? "border-primary bg-accent" : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="exportType"
                  value={value}
                  checked={exportType === value}
                  onChange={(e) => setExportType(e.target.value)}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalVisible(false)}>Cancel</Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransactionsTable;
