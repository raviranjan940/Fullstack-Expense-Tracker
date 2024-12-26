import React, { useRef, useState } from "react";
import { Table, Select, Radio, DatePicker, Modal } from "antd";
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
            const newTransaction = {
              ...transaction,
              amount: parseInt(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.files = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Tag", dataIndex: "tag", key: "tag" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Date", dataIndex: "date", key: "date" },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = search
      ? transaction.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;
    const startDateMatch = startDate
      ? new Date(transaction.date) >= startDate
      : true;
    const endDateMatch = endDate ? new Date(transaction.date) <= endDate : true;

    return (
      searchMatch && tagMatch && typeMatch && startDateMatch && endDateMatch
    );
  });

  let sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0;
    }
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

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
  
    if (exportFormat === "csv") {
      const csv = unparse({
        fields: ["name", "type", "date", "amount", "tag"],
        data: filteredData,
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
      const tableColumn = ["Name", "Type", "Date", "Amount", "Tag"];
      const tableRows = filteredData.map((transaction) => [
        transaction.name,
        transaction.type,
        transaction.date,
        transaction.amount,
        transaction.tag,
      ]);
  
      // Import logo (ensure the logo is accessible, you can also use a URL if it's hosted online)
      const logo = require("../../assets/satyalok.png"); // Adjust this path as needed
  
      // Get the dimensions of the logo
      const logoWidth = 70; // Adjust according to your logo's width
      const logoHeight = 20; // Adjust according to your logo's height
  
      // Calculate the position to center the logo
      const xPosition = (doc.internal.pageSize.width - logoWidth) / 2; // Center horizontally
      const yPosition = 10; // Position logo at the top
  
      // Add logo to PDF (centered)
      doc.addImage(logo, "PNG", xPosition, yPosition, logoWidth, logoHeight, undefined, "NONE");
  
      // Set title
      doc.setFontSize(18);
      doc.text("Satyalok Transactions Report", 105, 40, null, null, "center");
  
      // Add some space after the title to separate it from the table
      doc.setFontSize(12);
      doc.text("Below is the list of transactions:", 105, 50, null, null, "center");
  
      // Create the table
      doc.autoTable({
        startY: 60, // Ensure the table starts below the text
        head: [tableColumn],
        body: tableRows,
        margin: { top: 10 }, // Add margin for better spacing
        theme: "striped", // You can add a striped theme for better visibility
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
                onChange={(date) => setStartDate(date ? date.toDate() : null)}
              />
              <DatePicker
                className="start-end-date"
                placeholder="End Date"
                onChange={(date) => setEndDate(date ? date.toDate() : null)}
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
