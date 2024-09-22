import React from "react";
import "./styles.css";
import { Card, Row } from "antd";
import Button from "../Button";

function Cards({income, expenses, totalBalance, showExpenseModal, showIncomeModal, reset}) {
  return (
    <div>
      <Row className="my-row">
        <Card bordered={true} className="my-card" title="Current Balance">
          <p>₹{totalBalance}</p>
          <Button text="Reset Balance" blue={true} onClick={reset} />
        </Card>
        <Card bordered={true} className="my-card" title="Total Income">
          <p>₹{income}</p>
          <Button text="Add Income" blue={true} onClick={showIncomeModal} />
        </Card>
        <Card bordered={true} className="my-card" title="Total Expenses">
          <p>₹{expenses}</p>
          <Button text="Add Expense" blue={true} onClick={showExpenseModal}/>
        </Card>
      </Row>
    </div>
  );
}

export default Cards;
