"use client";
import React from "react";
import ExpenseListTable from "./_components/ExpenseListTable";
import { useUser } from "@/lib/auth-client";
import BackButton from "../_components/BackButton";
import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import {
  expenseApi,
  getCurrentMonthKey,
  toUiExpense,
} from "@/lib/api-client";
import MonthSelector from "../_components/MonthSelector";

function page() {
  const [expensesList, setExpensesList] = useState([]);
  const { user } = useUser();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  useEffect(() => {
    user && getAllExpenses(selectedMonth);
  }, [user, selectedMonth]);

  const [loading, setLoading] = useState(false);
  const getAllExpenses = async (month) => {
    setLoading(true);
    try {
      const expenses = await expenseApi.list(month);
      const normalizedExpenses = expenses
        .map(toUiExpense)
        .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
      setExpensesList(normalizedExpenses);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="ml-8 w-[80%]">
      <div>
        <BackButton />
        <div className="my-6">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} label="Expense month" />
        </div>
        <ExpenseListTable
          expensesList={expensesList}
          refreshData={() => getAllExpenses(selectedMonth)}
          readOnly={selectedMonth !== getCurrentMonthKey()}
        />
        {loading && <Loader className="mx-auto my-20" size="50" />}
      </div>
    </div>
  );
}

export default page;
