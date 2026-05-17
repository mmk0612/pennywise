import { UserButton } from "@/lib/auth-client";
import React from "react";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { budgetApi } from "@/lib/api-client";

function DashboardHeader() {
  const router = useRouter();
  const handleSearch = async (query) => {
    if (!query?.trim()) {
      toast.error("Please enter a budget name");
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const budgets = await budgetApi.list();
    const match = budgets.find(
      (budget) => budget.name?.toLowerCase() === lowerCaseQuery,
    );

    if (!match?.id) {
      toast.error("Oops! No Budget found");
    } else {
      router.push(`/dashboard/expenses/${match.id}`);
    }
  };
  return (
    <div className="p-5 shadow-md border-bt flex justify-between bg-blue-600 z-10">
      <div className="flex-grow justify-center ml-20 z-10">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="flex gap-2 items-center text-gray-400 hover:text-gray-50 z-10">
        <UserButton />
      </div>
    </div>
  );
}

export default DashboardHeader;
