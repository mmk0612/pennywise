import Link from "next/link";
import React from "react";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function BudgetItem({ budgetInfo, onDelete }) {
  const calculateProgressPercentage = () => {
    if (budgetInfo.totalSpent >= budgetInfo.amount) return 100;
    const percentage = (budgetInfo.totalSpent / budgetInfo.amount) * 100;
    return percentage.toFixed(2);
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!onDelete) return;

    const confirmed = window.confirm(
      `Delete budget \"${budgetInfo.name}\"? This cannot be undone.`,
    );
    if (!confirmed) return;

    await onDelete(budgetInfo.id);
  };

  return (
    <div className="relative p-5 border rounded-lg hover:shadow-md h-[170px] bg-white">
      <Link
        href={`/dashboard/expenses/${budgetInfo?.id}`}
        className="block h-full pr-10"
      >
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl p-3 bg-slate-100 rounded-full">
              {budgetInfo?.icon}
            </h2>
            <div>
              <h2 className="font-bold ">{budgetInfo.name}</h2>
              <h2 className="text-sm text-gray-500">
                {budgetInfo.totalCount} Items
              </h2>
            </div>
          </div>
          <h2 className="font-bold text-blue-800 text-lg">
            Rs.{budgetInfo.amount}
          </h2>
        </div>
        <div className="mt-5 ">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-slate-400">
              Rs {budgetInfo.totalSpent ? budgetInfo.totalSpent : 0} Spent
            </h2>
            <h2 className="text-xs text-slate-400">
              Rs{" "}
              {budgetInfo.totalSpent &&
                (budgetInfo.amount > budgetInfo.totalSpent
                  ? `${budgetInfo.amount - budgetInfo.totalSpent} Remaining`
                  : `${budgetInfo.totalSpent - budgetInfo.amount} OverSpent`)}
            </h2>
          </div>
          <div className="w-full bg-slate-300 h-2 rounded-full">
            <div
              className="bg-blue-800 h-2 rounded-full"
              style={{ width: `${calculateProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </Link>

      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleDelete}
          aria-label={`Delete ${budgetInfo.name}`}
        >
          <TrashIcon size={16} />
        </Button>
      )}
    </div>
  );
}

export default BudgetItem;
