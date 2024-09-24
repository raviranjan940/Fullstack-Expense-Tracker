import React from "react";
import { Modal, Button } from "antd";
import { CSVLink } from "react-csv";

function ResetWarningModal({
  isVisible,
  handleCancel,
  handleConfirm,
  transactions,
}) {
  // Prepare CSV headers and data for export
  const headers = [
    { label: "Type", key: "type" },
    { label: "Date", key: "date" },
    { label: "Amount", key: "amount" },
    { label: "Tag", key: "tag" },
    { label: "Name", key: "name" },
  ];

  const csvData = transactions.map((transaction) => ({
    type: transaction.type,
    date: transaction.date,
    amount: transaction.amount,
    tag: transaction.tag,
    name: transaction.name,
  }));

  return (
    <Modal
      title="Warning..."
      visible={isVisible}
      onCancel={handleCancel}
      footer={null} 
    >
      <p>
        By clicking the "Reset Balance" button, all your data, including the
        transaction history, will be deleted from the database and also from  your account.
      </p>
      <p>
        If you want to save your transaction data, please export it as a CSV
        file before proceeding, which later you can import to get back your all data.
      </p>

      
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <Button type="primary" onClick={handleConfirm}>
          Reset Balance
        </Button>

        <CSVLink data={csvData} headers={headers} filename={"transactions.csv"}>
          <Button type="default">Export to CSV</Button>
        </CSVLink>

        <Button type="default" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default ResetWarningModal;
