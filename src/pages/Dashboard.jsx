import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from "firebase/firestore";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import TransactionsTable from "@/components/TransactionsTable";
import AddExpenseModal from "@/components/Modals/addExpense";
import AddIncomeModal from "@/components/Modals/addIncome";
import ResetWarningModal from "@/components/Modals/resetBalance";

import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Cards from "@/components/Cards";
import Footer from "@/components/Footer";

import { db } from "@/lib/firebase";

function Dashboard() {
  // Modal Visibility States
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);

  // Transaction States
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Financial Summary States
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  // Tag States
  const [expenseTags, setExpenseTags] = useState([]);
  const [incomeTags, setIncomeTags] = useState([]);

  // Authentication State
  const { isLoaded: authLoading, user } = useUser();
  const navigate = useNavigate();

  // Auth Guard: redirect unauthenticated users away from the dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Modal Handlers
  const showExpenseModal = () => setIsExpenseModalVisible(true);
  const showIncomeModal = () => setIsIncomeModalVisible(true);
  const handleExpenseCancel = () => setIsExpenseModalVisible(false);
  const handleIncomeCancel = () => setIsIncomeModalVisible(false);
  const showWarningModal = () => setIsWarningModalVisible(true);
  const handleWarningCancel = () => setIsWarningModalVisible(false);

  const handleWarningConfirm = async () => {
    setIsWarningModalVisible(false);
    await resetTransactions();
  };

  // Fetch Transactions on Component Mount and when User Changes
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calculate Financial Summary whenever Transactions Change
  useEffect(() => {
    calculateBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  // Add New Transaction
  const onFinish = (values, type) => {
    const amount = parseFloat(values.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const newTransaction = {
      type: type,
      date: values.date.format("DD-MM-YYYY"),
      amount: amount,
      tag: values.tag,
      name: values.name,
    };
    addTransaction(newTransaction);
  };

  // Function to Add Transaction to Firestore
  async function addTransaction(transaction, isBulk = false) {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.id}/transactions`), transaction);
      if (!isBulk) toast.success("Transaction Added!");
      await fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction: ", error);
      if (!isBulk) toast.error("Couldn't add transaction");
    }
  }

  // Function to Update Transaction in Firestore
  async function updateTransaction(updatedTransaction) {
    if (!user) return;
    try {
      const transactionDocRef = doc(db, `users/${user.id}/transactions/${updatedTransaction.id}`);
      await updateDoc(transactionDocRef, {
        name: updatedTransaction.name,
        amount: updatedTransaction.amount,
        tag: updatedTransaction.tag,
        type: updatedTransaction.type,
        date: updatedTransaction.date,
      });
      toast.success("Transaction updated successfully!");
      await fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction: ", error);
      toast.error("Couldn't update transaction");
    }
  }

  // Function to Delete a Single Transaction from Firestore
  async function deleteTransaction(transactionId) {
    if (!user) return;
    try {
      const transactionDocRef = doc(db, `users/${user.id}/transactions/${transactionId}`);
      await deleteDoc(transactionDocRef);
      toast.success("Transaction deleted successfully!");
      await fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      toast.error("Couldn't delete transaction");
    }
  }

  // Function to Fetch Transactions from Firestore
  async function fetchTransactions() {
    if (!user) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, `users/${user.id}/transactions`));
      const querySnapshot = await getDocs(q);
      const transactionsArray = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setTransactions(transactionsArray);
      // Optional: Remove toast.success("Transactions Fetched!"); if too frequent
    } catch (error) {
      console.error("Error fetching transactions: ", error);
      toast.error("Failed to fetch transactions");
    }
    setLoading(false);
  }

  // Function to Calculate Financial Summary
  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        incomeTotal += transaction.amount;
      } else {
        expensesTotal += transaction.amount;
      }
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setTotalBalance(incomeTotal - expensesTotal);
  };

  // Function to Reset All Transactions
  async function resetTransactions() {
    if (!user) return;

    try {
      const q = query(collection(db, `users/${user.id}/transactions`));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(docSnapshot.ref)
      );
      await Promise.all(deletePromises);

      // Reset Local State
      setTransactions([]);
      setIncome(0);
      setExpenses(0);
      setTotalBalance(0);
      toast.success("Transactions Reset Successfully!");
    } catch (error) {
      console.error("Error resetting transactions: ", error);
      toast.error("Failed to reset transactions");
    }
  }

  if (!authLoading) return <Loader />;
  if (!user) return null;

  return (
    <div>
      {/* Header Component */}
      <Header
        expenseTags={expenseTags}
        incomeTags={incomeTags}
        setExpenseTags={setExpenseTags}
        setIncomeTags={setIncomeTags}
      />

      {/* Loader */}
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Financial Summary Cards */}
          <Cards
            income={income}
            expenses={expenses}
            totalBalance={totalBalance}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            showWarningModal={showWarningModal}
          />

          {/* Add Expense Modal */}
          <AddExpenseModal
            expenseTags={expenseTags}
            setExpenseTags={setExpenseTags}
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />

          {/* Add Income Modal */}
          <AddIncomeModal
            incomeTags={incomeTags}
            setIncomeTags={setIncomeTags}
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />

          {/* Transactions Table with Edit and Delete Functionality */}
          <TransactionsTable
            incomeTags={incomeTags}
            expenseTags={expenseTags}
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction} // Pass deleteTransaction as a prop
            fetchTransactions={fetchTransactions}
          />

          {/* Footer Component */}
          <Footer />

          {/* Reset Warning Modal */}
          <ResetWarningModal
            isVisible={isWarningModalVisible}
            handleCancel={handleWarningCancel}
            handleConfirm={handleWarningConfirm}
            transactions={transactions}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
