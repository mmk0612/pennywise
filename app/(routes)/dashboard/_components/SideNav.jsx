"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Menu,
  FileText,
} from "lucide-react";
import { UserButton } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuList = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Budgets",
      icon: PiggyBank,
      path: "/dashboard/budgets",
    },
    {
      id: 3,
      name: "Expenses",
      icon: ReceiptText,
      path: "/dashboard/expenses",
    },
    {
      id: 4,
      name: "Statements",
      icon: FileText,
      path: "/dashboard/statements",
    },
    {
      id: 5,
      name: "Upgrade",
      icon: ShieldCheck,
      path: "/dashboard/upgrade",
    },
  ];
  const path = usePathname();
  const { user } = useUser();

  return (
    <div>
      <div className="md:hidden p-5 flex justify-between items-center w-full">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 bg-blue-700 hover:text-gray-50"
        >
          <Menu size={24} />
        </Button>
      </div>
      <div
        className={`fixed md:w-64 h-screen bg-blue-600 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={160}
          height={100}
          className="p-3"
        />
        <div>
          {menuList.map((menu, index) => (
            <Link href={menu.path} key={index} onClick={() => setIsOpen(false)}>
              <h2
                className={`flex gap-2 mb-1 items-center text-gray-400 font-med p-3 cursor-pointer rounded-md hover:text-gray-50 hover:bg-blue-800 ${
                  path == menu.path && "text-gray-50 bg-blue-800"
                }`}
              >
                <menu.icon size={24} />
                {menu.name}
              </h2>
            </Link>
          ))}
        </div>
        <div className="fixed bottom-10 p-5 flex gap-2 items-center text-gray-400 hover:text-gray-50">
          <UserButton />
          {user?.fullName}
        </div>
      </div>
    </div>
  );
}

export default SideNav;
