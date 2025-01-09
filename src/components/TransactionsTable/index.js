import React, { useRef, useState } from "react";
import {
  Table,
  Radio,
  DatePicker,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tooltip,
} from "antd";
import moment from "moment";
import { parse, unparse } from "papaparse";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons"; // Import Ant Design Icons
import "./styles.css";
import Button from "../Button";
import SearchImg from "../../assets/search.svg";

const { Option } = Select;

function TransactionsTable({
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction, // Receive deleteTransaction as a prop
  fetchTransactions,
  incomeTags,
  expenseTags,
}) {
  // State Variables for Filtering, Sorting, and Searching
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // State Variables for Export Functionality
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("");

  // State Variables for Edit Functionality
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form] = Form.useForm();

  // State Variables for Delete Confirmation Modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const fileInput = useRef();

  // Function to Import Transactions from CSV
  async function importFromCsv(event) {
    event.preventDefault();
    try {
      const file = event.target.files[0];
      if (!file) {
        toast.error("No file selected");
        return;
      }

      parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            // Validate required fields
            if (
              transaction.Name &&
              transaction.Type &&
              transaction.Date &&
              transaction.Tag &&
              transaction.Amount
            ) {
              // Parse and validate the date
              const parsedDate = moment(transaction.Date, ["DD-MM-YYYY", "YYYY-MM-DD"], true);
              if (!parsedDate.isValid()) {
                toast.error(
                  `Invalid date format for transaction "${transaction.Name}". Expected DD-MM-YYYY or YYYY-MM-DD.`
                );
                continue; // Skip this transaction
              }

              const newTransaction = {
                name: transaction.Name,
                type: transaction.Type,
                date: parsedDate.format("DD-MM-YYYY"),
                tag: transaction.Tag,
                amount: parseFloat(transaction.Amount),
              };
              console.log("newTransaction", newTransaction);
              await addTransaction(newTransaction, true);
            }
          }
          toast.success("All valid Transactions Added");
          await fetchTransactions();
          event.target.files = null;
        },
        error: function (error) {
          toast.error(`Error parsing CSV file: ${error.message}`);
        },
      });
    } catch (e) {
      toast.error(e.message);
    }
  }

  // Define Table Columns with Action Column for Editing and Deleting
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      sortDirections: ["ascend", "descend"],
      render: (amount) => `Rs ${amount.toFixed(2)}`,
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
      filters: [
        ...incomeTags.map((tag) => ({ text: tag, value: tag })),
        ...expenseTags.map((tag) => ({ text: tag, value: tag })),
      ],
      onFilter: (value, record) => record.tag === value,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Income", value: "income" },
        { text: "Expense", value: "expense" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) =>
        type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => {
        const dateA = moment(a.date, "DD-MM-YYYY").toDate();
        const dateB = moment(b.date, "DD-MM-YYYY").toDate();
        return dateA - dateB;
      },
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          {/* Edit Icon with Tooltip */}
          <Tooltip title="Edit Transaction">
            <EditOutlined
              style={{ color: "#1890ff", cursor: "pointer", fontSize: "1.3em" }}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          {/* Delete Icon with Tooltip */}
          <Tooltip title="Delete Transaction">
            <DeleteOutlined
              style={{ color: "#ff4d4f", cursor: "pointer", fontSize: "1.3em" }}
              onClick={() => openDeleteModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Function to Open the Edit Modal and Populate Form Fields
  const openEditModal = (transaction) => {
    // Parse the transaction date with multiple formats and strict parsing
    const parsedDate = transaction.date
      ? moment(transaction.date, ["DD-MM-YYYY", "YYYY-MM-DD"], true)
      : null;

    if (transaction.date && !parsedDate.isValid()) {
      toast.error(
        `Invalid date format for transaction "${transaction.name}". Expected DD-MM-YYYY or YYYY-MM-DD.`
      );
      return; // Do not open the modal if date is invalid
    }

    setEditingTransaction(transaction);
    setIsEditModalVisible(true);

    form.setFieldsValue({
      name: transaction.name,
      amount: transaction.amount,
      tag: transaction.tag,
      type: transaction.type,
      date: parsedDate ? parsedDate : null, // Set as moment object
    });
  };

  // Handle Edit Form Submission
  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      const updatedTransaction = {
        ...editingTransaction,
        name: values.name,
        amount: parseFloat(values.amount),
        tag: values.tag,
        type: values.type,
        date: values.date
          ? values.date.format("DD-MM-YYYY") // Ensure consistent formatting
          : editingTransaction.date,
      };
      await updateTransaction(updatedTransaction);
      toast.success("Transaction updated successfully");
      setIsEditModalVisible(false);
      setEditingTransaction(null);
      form.resetFields();
    } catch (errorInfo) {
      console.log("Failed to update transaction:", errorInfo);
      toast.error("Failed to update transaction. Please check the form fields.");
    }
  };

  // Handle Cancelling the Edit
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
    form.resetFields();
  };

  // Function to Open the Delete Confirmation Modal
  const openDeleteModal = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalVisible(true);
  };

  // Handle Deletion Confirmation
  const handleDeleteConfirm = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        toast.success("Transaction deleted successfully");
      } catch (error) {
        console.log("Failed to delete transaction:", error);
        toast.error("Failed to delete transaction.");
      }
      setIsDeleteModalVisible(false);
      setTransactionToDelete(null);
    }
  };

  // Handle Deletion Cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setTransactionToDelete(null);
  };

  // Filter Transactions Based on Search and Filters
  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = search
      ? transaction.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;

    const transactionDate = transaction.date
      ? moment(transaction.date, "DD-MM-YYYY").toDate()
      : new Date();

    const startDateMatch = startDate ? transactionDate >= startDate : true;
    const endDateMatch = endDate ? transactionDate <= endDate : true;

    return searchMatch && tagMatch && typeMatch && startDateMatch && endDateMatch;
  });

  // Sort Transactions Based on Selected Sort Key
  let sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      const dateA = a.date
        ? moment(a.date, "DD-MM-YYYY").toDate()
        : new Date(0); // Default to epoch if date is invalid
      const dateB = b.date
        ? moment(b.date, "DD-MM-YYYY").toDate()
        : new Date(0);
      return dateA - dateB;
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    } else {
      return 0; // No sorting applied
    }
  });

  // Prepare Data Source for the Table
  const dataSource = sortedTransactions.map((transaction) => ({
    key: transaction.id, // Unique key using transaction ID
    ...transaction,
  }));

  console.log("dataSource", dataSource);

  // Function to Show Export Modal
  function showExportModal(format) {
    setExportFormat(format);
    setIsExportModalVisible(true);
  }

  // Handle Export Functionality (CSV & PDF)
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
      // Prepare CSV Data with a Total Row
      const csvData = [
        ...filteredData.map(({ name, type, date, tag, amount }) => [
          name,
          type,
          date,
          tag,
          amount,
        ]),
        ["TOTAL", "", "", "", totalAmount],
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
        `Rs ${transaction.amount.toFixed(2)}`,
      ]);

      // Add Total Row
      tableRows.push(["TOTAL", "", "", "", `Rs ${totalAmount.toFixed(2)}`]);

      // Import and Add Logo (Ensure the path is correct)
      try {
        const logo = require("../../assets/satyalok.png"); // Adjust path as necessary
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
      } catch (error) {
        console.log("Logo not found or failed to load:", error);
        toast.error("Failed to load logo for PDF.");
      }

      doc.setFontSize(18);
      doc.text("Satyalok Transactions Report", doc.internal.pageSize.width / 2, 40, {
        align: "center",
      });
      doc.setFontSize(12);
      doc.text(
        "Below is the list of transactions:",
        doc.internal.pageSize.width / 2,
        50,
        { align: "center" }
      );

      // Generate Table in PDF
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
          if (row.index === tableRows.length - 1) {
            return { fontStyle: "bold", fillColor: [220, 220, 220] };
          }
          return {};
        },
        columnStyles: {
          0: { halign: "left" },
          4: { halign: "right" },
        },
      });

      // Save the PDF
      doc.save("transactions.pdf");
    }
    setIsExportModalVisible(false);
  }

  return (
    <div className="main-container">
      {/* Search and Filter Section */}
      <div className="search-container">
        <div className="input-flex">
          <img src={SearchImg} width="16" alt="Search" />
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
        >
          <option value="">All</option>
          {incomeTags.map((tag) => (
            <option key={`income-tag-${tag}`} value={tag}>
              {tag}
            </option>
          ))}
          {expenseTags.map((tag) => (
            <option key={`expense-tag-${tag}`} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions Table Section */}
      <div className="my-table">
        <div className="tab-grp-wrapper">
          <h2>My Transactions</h2>

          {/* Sort Options */}
          <Radio.Group
            className="input-radio"
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
          >
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>

          {/* Date Range Pickers */}
          <div className="btn-container">
            <DatePicker
              className="start-end-date"
              placeholder="Start Date"
              format="DD-MM-YYYY"
              onChange={(date) => {
                setStartDate(date ? date.startOf("day").toDate() : null);
                console.log("Start Date Selected:", date);
              }}
              allowClear
            />
            <DatePicker
              className="start-end-date"
              placeholder="End Date"
              format="DD-MM-YYYY"
              onChange={(date) => {
                setEndDate(date ? date.endOf("day").toDate() : null);
                console.log("End Date Selected:", date);
              }}
              allowClear
            />
          </div>

          {/* Export and Import Buttons */}
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

        {/* Transactions Table */}
        <Table
          className="table-mod"
          columns={columns}
          dataSource={dataSource}
          rowKey={(record) => record.id} // Unique key for each row
          pagination={{ pageSize: 10 }}
          bordered
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Export Modal */}
      <Modal
        title="Export Transactions"
        visible={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => setIsExportModalVisible(false)}
        okText="Export"
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

      {/* Edit Transaction Modal */}
      <Modal
        title="Edit Transaction"
        visible={isEditModalVisible}
        onOk={handleEdit}
        onCancel={handleEditCancel}
        okText="Save"
      >
        <Form
          form={form}
          layout="vertical"
          name="edit_transaction_form"
        >
          {/* Transaction Name */}
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please enter the transaction name" },
            ]}
          >
            <Input placeholder="Enter transaction name" />
          </Form.Item>

          {/* Transaction Amount */}
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Please enter the amount" },
              {
                type: "number",
                min: 0,
                message: "Amount must be a positive number",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `Rs ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
              placeholder="Enter amount"
            />
          </Form.Item>

          {/* Transaction Tag */}
          <Form.Item
            name="tag"
            label="Tag"
            rules={[
              { required: true, message: "Please select a tag" },
            ]}
          >
            <Select placeholder="Select a tag">
              {incomeTags.map((tag) => (
                <Option key={`income-select-${tag}`} value={tag}>
                  {tag}
                </Option>
              ))}
              {expenseTags.map((tag) => (
                <Option key={`expense-select-${tag}`} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Transaction Type */}
          <Form.Item
            name="type"
            label="Type"
            rules={[
              { required: true, message: "Please select the type" },
            ]}
          >
            <Select placeholder="Select type">
              <Option value="income">Income</Option>
              <Option value="expense">Expense</Option>
            </Select>
          </Form.Item>

          {/* Transaction Date */}
          <Form.Item
            name="date"
            label="Date"
            rules={[
              { required: true, message: "Please select the date" },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject("Please select the date");
                  }
                  if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                    return Promise.reject("Date must be in DD-MM-YYYY format");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
              onChange={(date, dateString) => {
                // Optional: Handle any additional logic on date change
                console.log("Selected Date in Edit Modal:", date, dateString);
              }}
              allowClear={false}
              placeholder="Select date"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        visible={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete the transaction "
          <strong>{transactionToDelete?.name}</strong>"?
        </p>
      </Modal>
    </div>
  );
}

export default TransactionsTable;
