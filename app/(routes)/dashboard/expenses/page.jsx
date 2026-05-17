"use client";
import React from "react";
import ExpenseListTable from "./_components/ExpenseListTable";
import { useUser } from "@/lib/auth-client";
import BackButton from "../_components/BackButton";
import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { expenseApi, toUiExpense } from "@/lib/api-client";

function page() {
  const [expensesList, setExpensesList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && getAllExpenses();
  }, [user]);

  const [loading, setLoading] = useState(false);
  const getAllExpenses = async () => {
    setLoading(true);
    try {
      const expenses = await expenseApi.list();
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
        <ExpenseListTable
          expensesList={expensesList}
          refreshData={() => getAllExpenses()}
        />
        {loading && <Loader className="mx-auto my-20" size="50" />}
      </div>
    </div>
  );
}

export default page;
