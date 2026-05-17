"use client";
import React from "react";
import CreateBudget from "./CreateBudget";
import { useUser } from "@/lib/auth-client";
import { useState } from "react";
import { useEffect } from "react";
import BudgetItem from "./BudgetItem";
import { budgetApi, expenseApi, mergeBudgetStats } from "@/lib/api-client";
import { toast } from "sonner";

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    user && getBudgetList();
  }, [user]);

  const getBudgetList = async () => {
    setIsLoading(true);
    try {
      const [budgets, expenses] = await Promise.all([
        budgetApi.list(),
        expenseApi.list(),
      ]);

      const mergedBudgets = mergeBudgetStats(budgets, expenses).sort(
        (a, b) => Number(b.id) - Number(a.id),
      );

      setBudgetList(mergedBudgets);
    } catch (error) {
      console.error("Error fetching budget list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      await budgetApi.delete(budgetId);
      toast.success("Budget deleted successfully");
      await getBudgetList();
    } catch (error) {
      toast.error(error.message || "Failed to delete budget");
    }
  };

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget refreshData={getBudgetList} />
        {isLoading ? (
          [1, 2, 3, 4, 5].map((item, index) => (
            <div
              key={index}
              className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse"
            ></div>
          ))
        ) : budgetList.length > 0 ? (
          budgetList.map((budget, index) => (
            <BudgetItem
              budgetInfo={budget}
              key={index}
              onDelete={handleDeleteBudget}
            />
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default BudgetList;
