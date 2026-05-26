"use client";
import React from "react";
import CreateBudget from "./CreateBudget";
import { useUser } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import BudgetItem from "./BudgetItem";
import {
  budgetApi,
  expenseApi,
  mergeBudgetStats,
  getCurrentMonthKey,
} from "@/lib/api-client";
import { toast } from "sonner";

function BudgetList({
  selectedMonth = getCurrentMonthKey(),
  comparisonMonth = null,
  isCumulative = false,
}) {
  const [budgetList, setBudgetList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const isCurrentMonth = !isCumulative && selectedMonth === getCurrentMonthKey();

  useEffect(() => {
    user && getBudgetList(selectedMonth, comparisonMonth, isCumulative);
  }, [user, selectedMonth, comparisonMonth, isCumulative]);

  const getBudgetList = async (month, secondMonth, cumulativeMode) => {
    setIsLoading(true);
    try {
      const monthsToLoad = cumulativeMode && secondMonth ? [month, secondMonth] : [month];
      const monthBudgets = await Promise.all(
        monthsToLoad.map(async (monthKey) => {
          const [budgets, expenses] = await Promise.all([
            budgetApi.list(monthKey),
            expenseApi.list(monthKey),
          ]);

          const mergedBudgets = mergeBudgetStats(budgets, expenses).sort(
            (a, b) => Number(b.id) - Number(a.id),
          );

          return mergedBudgets;
        }),
      );

      const mergedBudgets = monthBudgets
        .flat()
        .sort((a, b) => {
          if (a.billingMonth !== b.billingMonth) {
            return b.billingMonth.localeCompare(a.billingMonth);
          }

          return Number(b.id) - Number(a.id);
        });

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
      await getBudgetList(selectedMonth, comparisonMonth, isCumulative);
    } catch (error) {
      toast.error(error.message || "Failed to delete budget");
    }
  };

  return (
    <div className="mt-7">
      {budgetList.length > 0 ? (
        <div className="mb-5 rounded-xl border bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                {isCumulative ? "Cumulative budget" : "Budget summary"}
              </h3>
              <p className="text-xs text-slate-500">
                {isCumulative
                  ? `Combining ${selectedMonth} and ${comparisonMonth}.`
                  : `Showing ${selectedMonth}.`}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {budgetList.length} budget entries
            </div>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isCurrentMonth ? <CreateBudget refreshData={() => getBudgetList(selectedMonth, comparisonMonth, isCumulative)} /> : null}
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
              onDelete={isCurrentMonth ? handleDeleteBudget : undefined}
              readOnly={!isCurrentMonth}
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
