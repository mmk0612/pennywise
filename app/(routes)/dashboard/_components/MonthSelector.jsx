"use client";

import React from "react";
import { getMonthOptions } from "@/lib/api-client";

function MonthSelector({ value, onChange, label = "Month" }) {
  const monthOptions = getMonthOptions(12);

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">Switch between billing months to review archived and active data.</p>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span>Selected</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-[170px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.value})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default MonthSelector;