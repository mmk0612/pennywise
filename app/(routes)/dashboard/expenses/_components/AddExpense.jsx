"use client";
import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { expenseApi } from "@/lib/api-client";
function AddExpense({ budgetId, refreshData }) {
  const [amount, setAmount] = useState(0);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const addNewExpense = async () => {
    setLoading(true);
    try {
      await expenseApi.create({
        title: name,
        amount: Number(amount),
        expenseDate: new Date().toISOString(),
        budgetId: Number(budgetId),
        categoryId: null,
        notes: null,
      });

      setAmount("");
      setName("");
      setLoading(false);
      refreshData();
      toast.success("Expense Added Successfully");
    } catch (error) {
      toast.error(error.message || "Failed to add expense");
    }
    setLoading(false);
  };

  return (
    <div className="border p-5 rounded-lg">
      <h2 className="font-bold text-lg">Add Expense</h2>
      <div className="mt-2">
        <h2 className="text-black font-medium my-1">Expense Name</h2>
        <Input
          value={name}
          placeholder="e.g. Bedroom Decor"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className="mt-2">
        <h2 className="text-black font-medium my-1">Expense Amount</h2>
        <Input
          value={amount}
          placeholder="e.g. Rs. 1000"
          onChange={(e) => {
            setAmount(e.target.value);
          }}
        />
      </div>
      <Button
        disabled={!(name && amount) || loading}
        className="mt-3 w-full bg-blue-800"
        onClick={() => addNewExpense()}
      >
        {loading ? <Loader className="animate spin" /> : "Add New Expense"}
      </Button>
    </div>
  );
}

export default AddExpense;
