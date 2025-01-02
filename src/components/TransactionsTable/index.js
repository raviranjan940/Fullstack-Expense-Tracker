import React, { useRef, useState } from "react";
import { Table, Radio, DatePicker, Modal } from "antd";
import SearchImg from "../../assets/search.svg";
import { parse, unparse } from "papaparse";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./styles.css";
import Button from "../Button";

function TransactionsTable({
  transactions,
  addTransaction,
  fetchTransactions,
  incomeTags,
  expenseTags,
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("");
  const fileInput = useRef();

  function importFromCsv(event) {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            if (
              transaction.Name &&
              transaction.Type &&
              transaction.Date &&
              transaction.Tag &&
              transaction.Amount
            ) {
              const newTransaction = {
                name: transaction.Name,
                type: transaction.Type,
                date: transaction.Date,
                tag: transaction.Tag,
                amount: parseInt(transaction.Amount),
              };
              console.log("newTransaction", newTransaction);
              await addTransaction(newTransaction, true);
            }
          }
          toast.success("All Transactions Added");
          await fetchTransactions();
          event.target.files = null;
        },
      });
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Tag", dataIndex: "tag", key: "tag" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = search ? transaction.name.toLowerCase().includes(search.toLowerCase()) : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;
  
    // Convert transaction.date from the specified format before comparison
    const transactionDate = transaction.date ? new Date(transaction.date.split('-').reverse().join('-')) : new Date();
  
    const startDateMatch = startDate ? transactionDate >= startDate : true;
    const endDateMatch = endDate ? transactionDate <= endDate : true;
  
    return searchMatch && tagMatch && typeMatch && startDateMatch && endDateMatch;
  });
  

  let sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      const dateA = a.date ? new Date(a.date.split('-').reverse().join('-')) : new Date();
      const dateB = b.date ? new Date(b.date.split('-').reverse().join('-')) : new Date();
      return dateA - dateB;
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0; // No sorting applied
    }
  });
  

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

  console.log("dataSource", dataSource);

  function showExportModal(format) {
    setExportFormat(format);
    setIsModalVisible(true);
  }

  function handleExport() {
    const filteredData =
      exportType === "all"
        ? sortedTransactions
        : sortedTransactions.filter(
            (transaction) => transaction.type === exportType
          );

    // Calculate the total sum of transactions
    const totalAmount = filteredData.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    if (exportFormat === "csv") {
      // Add a separator and the total row at the end of the data
      const csvData = [
        ...filteredData.map(({ name, type, date, tag, amount }) => [
          name,
          type,
          date,
          tag,
          amount,
        ]),
        // ["", "", "", "", ""], // Empty separator row
        ["TOTAL", "", "", "", totalAmount], // Total row
      ];

      const csv = unparse({
        fields: ["Name", "Type", "Date", "Tag", "Amount"],
        data: csvData,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transactions.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === "pdf") {
      const doc = new jsPDF();
      const tableColumn = ["Name", "Type", "Date", "Tag", "Amount"];
      const tableRows = filteredData.map((transaction) => [
        transaction.name,
        transaction.type,
        transaction.date,
        transaction.tag,
        transaction.amount,
      ]);

      // Add an empty row for spacing and then the Total row with bold styling
      // tableRows.push(["", "", "", "", ""]); // Empty separator row
      tableRows.push(["TOTAL", "", "", "", totalAmount]); // Total row

      // Import logo
      const logo = require("../../assets/satyalok.png"); // Adjust path if needed
      const logoWidth = 70;
      const logoHeight = 20;
      const xPosition = (doc.internal.pageSize.width - logoWidth) / 2;
      const yPosition = 10;

      doc.addImage(
        logo,
        "PNG",
        xPosition,
        yPosition,
        logoWidth,
        logoHeight,
        undefined,
        "NONE"
      );
      doc.setFontSize(18);
      doc.text("Satyalok Transactions Report", 105, 40, null, null, "center");
      doc.setFontSize(12);
      doc.text(
        "Below is the list of transactions:",
        105,
        50,
        null,
        null,
        "center"
      );

      doc.autoTable({
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        margin: { top: 10 },
        theme: "striped",
        styles: {
          fontSize: 10,
        },
        bodyStyles: (row, data) => {
          if (row[0] === "TOTAL") {
            return { fontStyle: "bold", fillColor: [220, 220, 220] }; // Highlight the row
          }
        },
        columnStyles: {
          0: { halign: "center" }, // Center align the TOTAL label
        },
      });

      // Save the PDF
      doc.save("transactions.pdf");
    }
    setIsModalVisible(false);
  }

  return (
    <div className="main-container">
      <div className="search-container">
        <div className="input-flex">
          <img src={SearchImg} width="16" />
          <input
            value={search}
            placeholder="Search by Name"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-input"
          onChange={(e) => setSelectedTag(e.target.value)}
          value={selectedTag}
          placeholder="Filter"
          allowClear
        >
          <option value="">All</option>
          {incomeTags.map((tag) => (
            <option value={tag}>{tag}</option>
          ))}
          {expenseTags.map((tag) => (
            <option value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="my-table">
        <div className="tab-grp-wrapper">
          <h2>My Transactions</h2>

          <Radio.Group
            className="input-radio"
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
          >
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>

          <div className="btn-container">
            <DatePicker
              className="start-end-date"
              placeholder="Start Date"
              format="DD-MM-YYYY"
              onChange={(date) =>
                setStartDate(date ? date.startOf("day").toDate() : null)
              }
            />
            <DatePicker
              className="start-end-date"
              placeholder="End Date"
              format="DD-MM-YYYY"
              onChange={(date) =>
                setEndDate(date ? date.endOf("day").toDate() : null)
              }
            />
          </div>
          <div className="btn-container">
            <Button
              text={"Export to CSV"}
              onClick={() => showExportModal("csv")}
            />
            <Button
              text={"Export to PDF"}
              onClick={() => showExportModal("pdf")}
            />
            <label htmlFor="file-csv" className="btn btn-blue">
              Import from CSV
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
        </div>
        <Table
          className="table-mod"
          columns={columns}
          dataSource={dataSource}
        />
      </div>

      <Modal
        title="Export Transactions"
        visible={isModalVisible}
        onOk={handleExport}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Select the type of transactions to export:</p>
        <Radio.Group
          onChange={(e) => setExportType(e.target.value)}
          value={exportType}
        >
          <Radio value="all">All Transactions</Radio>
          <Radio value="income">Income Only</Radio>
          <Radio value="expense">Expense Only</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
}

export default TransactionsTable;
