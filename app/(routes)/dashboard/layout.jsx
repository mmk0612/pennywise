"use client";
import { useEffect, React } from "react";
import { useRouter } from "next/navigation";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { useUser } from "@/lib/auth-client";
import { budgetApi } from "@/lib/api-client";

function dashboardLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    user && checkUserBudget();
  }, [user]);

  const checkUserBudget = async () => {
    const result = await budgetApi.list();

    if (result?.length == 0) {
      router.replace("/dashboard/budgets");
    }
  };

  return (
    <div className="flex">
      <div className="fixed md:relative md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow">
        <DashboardHeader />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default dashboardLayout;
