"use client";
import React from "react";
import BudgetList from "./_components/BudgetList";
import BackButton from "../_components/BackButton";
import MonthSelector from "../_components/MonthSelector";
import { getCurrentMonthKey, getPreviousMonthKey } from "@/lib/api-client";

function page() {
  const [selectedMonth, setSelectedMonth] = React.useState(getCurrentMonthKey());
  const [comparisonMonth, setComparisonMonth] = React.useState(getPreviousMonthKey());
  const [isCumulative, setIsCumulative] = React.useState(false);

  return (
    <div className="p-10">
      <BackButton />
      <h2 className="font-bold text-3xl">My Budgets</h2>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <input
            id="cumulative-view"
            type="checkbox"
            checked={isCumulative}
            onChange={(event) => setIsCumulative(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="cumulative-view" className="font-medium">
            Show cumulative budgets for 2 months
          </label>
        </div>
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} label="Primary month" />
        {isCumulative ? (
          <MonthSelector value={comparisonMonth} onChange={setComparisonMonth} label="Second month" />
        ) : null}
      </div>
      <BudgetList
        selectedMonth={selectedMonth}
        comparisonMonth={comparisonMonth}
        isCumulative={isCumulative}
      />
    </div>
  );
}

export default page;
