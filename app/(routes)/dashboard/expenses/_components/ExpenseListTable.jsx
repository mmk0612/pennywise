import { Trash, TrashIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { expenseApi } from "@/lib/api-client";

function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    try {
      await expenseApi.delete(expense.id);
      toast.success("Expense Deleted Successfully");
      refreshData();
    } catch (error) {
      toast.error(error.message || "Failed to delete expense");
    }
  };
  return (
    <div className="mt-3">
      <h2 className="text-lg font-bold mt-5 mb-5">Your Latest Expenses</h2>
      <div className="grid grid-cols-6 bg-slate-300 p-2">
        <h2 className="font-bold col-span-2">Name</h2>
        <h2 className="font-bold col-span-2">Amount</h2>
        <h2 className="font-bold hidden sm:block">Date</h2>
        <h2 className="font-bold">Action</h2>
      </div>
      {expensesList.map((expenses, index) => (
        <div className="grid grid-cols-6 bg-slate-50 p-2">
          <h2 className="col-span-2">{expenses.name}</h2>
          <h2 className="col-span-2">{expenses.amount}</h2>
          <h2 className="hidden sm:block">{expenses.createdAt}</h2>
          <h2>
            <TrashIcon
              onClick={() => deleteExpense(expenses)}
              className="text-red-600"
            />
          </h2>
        </div>
      ))}
    </div>
  );
}

export default ExpenseListTable;
