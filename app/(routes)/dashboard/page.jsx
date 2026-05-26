"use client";
import React from "react";
import { useUser } from "@/lib/auth-client";
import CardInfo from "./_components/CardInfo";
import { useState, useEffect } from "react";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";
import { Loader } from "lucide-react";
import MonthSelector from "./_components/MonthSelector";
import {
  budgetApi,
  expenseApi,
  getCurrentMonthKey,
  mergeBudgetStats,
  toUiExpense,
} from "@/lib/api-client";
export default function page() {
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  useEffect(() => {
    user && getBudgetList(selectedMonth);
  }, [user, selectedMonth]);

  const getBudgetList = async (month) => {
    setLoading(true);
    try {
      const [budgets, expenses] = await Promise.all([
        budgetApi.list(month),
        expenseApi.list(month),
      ]);

      const mergedBudgets = mergeBudgetStats(budgets, expenses).sort(
        (a, b) => Number(b.id) - Number(a.id),
      );
      setBudgetList(mergedBudgets);

      const normalizedExpenses = expenses
        .map(toUiExpense)
        .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
      setExpensesList(normalizedExpenses);
    } finally {
      setLoading(false);
    }
  };
  return loading ? (
    <Loader
      className="animate-spin mx-auto my-[250px] flex justify-between items-center"
      size={50}
    />
  ) : (
    <div className="p-8">
      <h2 className="font-bold text-3xl">Hi, {user?.fullName} ✌️</h2>
      <p className="text-gray-500">
        Here's what is happening with your money. Lets Manage your expenses and
        increase your smart savings.
      </p>
      <div className="mt-6">
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} label="Dashboard month" />
      </div>
      <CardInfo budgetList={budgetList} />
      <div className="grid sm:grid-cols-1 md:grid-cols-3 mt-6 gap-5">
        <div className="md:col-span-2 ">
          <BarChartDashboard budgetList={budgetList} />
          <ExpenseListTable
            expensesList={expensesList}
            refreshData={() => getBudgetList(selectedMonth)}
            readOnly={selectedMonth !== getCurrentMonthKey()}
          />
        </div>
        <div className="gap-5">
          <h2 className="font-bold text-lg">Your Latest Budgets</h2>
          {budgetList.map((budget, index) => (
            <div className="my-3">
              <BudgetItem budgetInfo={budget} key={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
