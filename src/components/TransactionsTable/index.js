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
  Checkbox,
  Upload,
  message,
  Divider,
} from "antd";
import {InboxOutlined} from "@ant-design/icons";
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
const {Dragger } = Upload;

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

  // Add only these new state variables for logo handling
  const [isLogoPreferenceModalVisible, setIsLogoPreferenceModalVisible] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

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
    if(format === "pdf") {
      setIsLogoPreferenceModalVisible(true);
    }else{
      setIsExportModalVisible(true);
    }
  }

   // Add these new functions for logo handling
   const handleLogoUpload = (info) => {
    const { file } = info;
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return;
    }

    setLogoFile(file);

    //create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoPreferenceConfirm = () => {
    if(includeLogo && !logoFile) {
      message.error('Please upload a logo before proceeding.');
      return;
    }
    setIsLogoPreferenceModalVisible(false);
    setIsExportModalVisible(true);
  };

  const handleLogoPreferenceCancel = () => {
    setIsLogoPreferenceModalVisible(false);
    setIncludeLogo(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const beforeLogoUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isImage && isLt2M;
  };

  // Handle Export Functionality (CSV & PDF)
  function handleExport() {
    const filteredData =
    exportType === "all"
      ? sortedTransactions
      : sortedTransactions.filter(
          (transaction) => transaction.type === exportType
        );

  // Calculate totals
  const incomeTotal = filteredData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenseTotal = filteredData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (exportFormat === "csv") {
    // [Keep existing CSV export code exactly as it was]
    const csvData = [
      ...filteredData.map(({ name, type, date, tag, amount }) => [
        name,
        type,
        date,
        tag,
        amount,
      ]),
    ];

    const csv = unparse({
      fields: ["Name", "Type", "Date", "Tag", "Amount"],
      data: csvData,
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "your_transactions_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (exportFormat === "pdf") {
    const doc = new jsPDF();
    let yPosition = 20;

    // Add logo if selected with fixed size
    if (includeLogo && logoFile) {
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const logoWidth = 80;
          const logoHeight = 20;
          doc.addImage(
            event.target.result,
            'JPEG',
            (doc.internal.pageSize.width - logoWidth) / 2,
            15,
            logoWidth,
            logoHeight
          );
          yPosition = 15 + logoHeight + 10;
          addPdfContent();
        } catch (error) {
          console.log("Failed to add logo:", error);
          addPdfContent();
        }
      };
      reader.readAsDataURL(logoFile);
    } else {
      addPdfContent();
    }
    
    function addPdfContent() {
      // Add title
      doc.setFontSize(18);
      doc.text("Transactions Report", doc.internal.pageSize.width / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Prepare table data (keeping original table structure)
      const tableColumn = columns
        .filter(col => col.key !== 'action')
        .map(col => col.title);
      
      const tableRows = filteredData.map(transaction => [
        transaction.name,
        `Rs ${transaction.amount.toFixed(2)}`,
        transaction.tag,
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
        transaction.date,
      ]);

      // Generate Table in PDF (keeping original structure)
      doc.autoTable({
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        margin: { top: 10 },
        theme: "striped",
        styles: {
          fontSize: 10,
        },
        columnStyles: {
          1: { halign: "right" },
        },

      // Add these options for better multi-page handling
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      tableWidth: 'auto',
      showHead: 'everyPage', // Show header on every page
      pageBreak: 'auto', // Automatic page breaks
      didDrawPage: function (data) {
        // Footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          'Page ' + doc.internal.getCurrentPageInfo().pageNumber + ' of ' + pageCount,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    });

    // Add totals section on the last page
    const finalY = doc.lastAutoTable.finalY || yPosition;
    
    // Check if we need a new page for totals
    if (finalY > doc.internal.pageSize.height - 50) {
      doc.addPage();
    }
    
    doc.setFontSize(10);
    doc.text(`Total Income: Rs ${incomeTotal.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 20);
    doc.text(`Total Expense: Rs ${expenseTotal.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 30);
    doc.text(`Available Amount: Rs ${(incomeTotal - expenseTotal).toFixed(2)}`, 14, doc.autoTable.previous.finalY + 40);

      // Save the PDF
      doc.save("your_transactions_report.pdf");
    }
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

      {/* Add this new modal for logo preferences */}
      <Modal
        title="PDF Export Options"
        visible={isLogoPreferenceModalVisible}
        onOk={handleLogoPreferenceConfirm}
        onCancel={handleLogoPreferenceCancel}
        okText="Continue to Export"
        cancelText="Cancel"
        width={500}
      >
        <Form layout="vertical">
          <Form.Item>
            <Checkbox
              checked={includeLogo}
              onChange={(e) => setIncludeLogo(e.target.checked)}
            >
              Include logo in PDF (70x20px)
            </Checkbox>
          </Form.Item>
          
          {includeLogo && (
            <>
            <Divider>Upload Your Logo</Divider>
            <Form.Item
              label="Upload Logo (Max 2MB)"
              extra="Recommended size: 70x20px for best results"
            >
              <Dragger
                name="logo"
                multiple={false}
                accept="image/*"
                beforeUpload={beforeLogoUpload}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess("ok");
                    handleLogoUpload({ file });
                  }, 0);
                }}
                showUploadList={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Supports JPG, PNG formats
                </p>
              </Dragger>
            </Form.Item>
            
            {logoPreview && (
              <Form.Item label="Logo Preview">
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  border: '1px dashed #d9d9d9',
                  padding: '10px',
                  borderRadius: '4px'
                }}>
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '100px',
                      objectFit: 'contain'
                    }} 
                  />
                </div>
              </Form.Item>
            )}
          </>
          )}
        </Form>
      </Modal>

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
          style={{marginBottom: 16}}
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
              parser={(value) => value.replace(/Rs\s?|(,*)/g, "")}
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
