"use client";

import React, { useState, useEffect } from "react";
import { statementApi, budgetApi } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader, CheckCircle, ArrowLeft, XCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CreateBudget from "../../budgets/_components/CreateBudget";

export default function ReviewPredictionsPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const uploadRequestId = Number(id);

  const [predictions, setPredictions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualBudgetId, setManualBudgetId] = useState("");
  const [manualDate, setManualDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const getPredictionKey = (prediction) =>
    prediction.predictionLogId ?? prediction.clientId;

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const handlePageShow = () => {
      fetchData();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [id]);

  const fetchData = async () => {
    try {
      const requests = await statementApi.getRequests();
      const currentRequest = requests.find(
        (request) => String(request.id) === String(id),
      );

      if (!currentRequest) {
        throw new Error("Statement request not found");
      }

      if (currentRequest.status !== "COMPLETED") {
        router.replace("/dashboard/statements");
        return;
      }

      const [preds, buds] = await Promise.all([
        statementApi.getPredictions(id),
        budgetApi.list(),
      ]);

      // Initialize the finalBudgetId with the AI's suggested ID if it exists
      const mappedPreds = preds
        .filter((p) => {
          const rawText = (p.rawText || "").trim();
          const title = (p.title || "").trim();
          return (
            rawText &&
            rawText !== "Queued for AI processing" &&
            title !== "Queued for AI processing"
          );
        })
        .map((p) => ({
          ...p,
          finalBudgetId: p.suggestedBudgetId || "",
          rejected: false,
        }));

      setPredictions(mappedPreds);
      setBudgets(buds);
    } catch (error) {
      toast.error(error.message || "Failed to load review data");
      setLoading(false);
    } finally {
      if (!submitting) {
        setLoading(false);
      }
    }
  };

  const handleBudgetChange = (predictionLogId, newBudgetId) => {
    setPredictions((prev) =>
      prev.map((p) =>
        getPredictionKey(p) === predictionLogId
          ? { ...p, finalBudgetId: newBudgetId, rejected: false }
          : p,
      ),
    );
  };

  const handleReject = (predictionLogId) => {
    setPredictions((prev) =>
      prev.map((p) =>
        getPredictionKey(p) === predictionLogId
          ? { ...p, finalBudgetId: "", rejected: true }
          : p,
      ),
    );
  };

  const handleAddManualExpense = () => {
    if (!manualTitle.trim()) {
      toast.error("Please enter an expense title.");
      return;
    }

    if (!manualAmount || Number(manualAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!manualBudgetId) {
      toast.error("Please select a budget for the manual expense.");
      return;
    }

    setPredictions((prev) => [
      ...prev,
      {
        clientId: `manual-${Date.now()}`,
        predictionLogId: null,
        title: manualTitle.trim(),
        rawText: "Manual expense added by user",
        amount: Number(manualAmount),
        finalBudgetId: manualBudgetId,
        suggestedBudgetId: null,
        rejected: false,
        manual: true,
        date: new Date(manualDate).toISOString(),
      },
    ]);

    setManualTitle("");
    setManualAmount("");
    setManualBudgetId("");
    setManualDate(new Date().toISOString().slice(0, 10));
    toast.success("Manual expense added to the review list.");
  };

  const handleSubmit = async () => {
    // Validate that all items have a budget assigned (optional depending on rules)
    const incomplete = predictions.some((p) => !p.finalBudgetId && !p.rejected);
    if (incomplete) {
      toast.error(
        "Please assign a budget or reject each transaction before confirming.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // Map back to ConfirmedExpenseDTO format
      const payload = predictions.map((p) => ({
        uploadRequestId,
        predictionLogId: p.predictionLogId,
        finalBudgetId: Number(p.finalBudgetId),
        rejected: Boolean(p.rejected),
        title: p.title,
        amount: p.amount,
        date: p.date,
      }));

      await statementApi.confirm(payload);
      toast.success("Expenses confirmed and saved successfully!");
      router.replace("/dashboard/expenses");
    } catch (error) {
      toast.error(error.message || "Failed to confirm expenses");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/statements"
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2" size={16} /> Back to Uploads
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-bold text-3xl">Review AI Categorization</h2>
          <p className="text-gray-500">
            Please verify and correct the budgets assigned by the AI before
            confirming.
          </p>
        </div>
        <div className="flex items-center">
          <CreateBudget
            refreshData={fetchData}
            trigger={
              <Button variant="outline" className="mr-3">
                <Plus className="mr-2" size={16} />
                New Budget
              </Button>
            }
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || predictions.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? (
              <Loader className="animate-spin mr-2" size={16} />
            ) : (
              <CheckCircle className="mr-2" size={16} />
            )}
            Confirm & Save All
          </Button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-lg">Add a manual expense</h3>
            <p className="text-sm text-gray-500">
              Add an item the AI missed before you save this review.
            </p>
          </div>
          <Plus className="text-slate-500" size={18} />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="Expense title"
            className="w-full p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            placeholder="Amount"
            className="w-full p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={manualBudgetId}
            onChange={(e) => setManualBudgetId(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Select a budget</option>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.icon} {b.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddManualExpense}
          >
            Add Expense
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        {predictions.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No predictions found for this request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="p-4 font-semibold text-sm w-1/4">
                    Extracted Title
                  </th>
                  <th className="p-4 font-semibold text-sm w-1/6">Amount</th>
                  <th className="p-4 font-semibold text-sm">Raw Line</th>
                  <th className="p-4 font-semibold text-sm w-1/4">
                    Budget Category
                  </th>
                  <th className="p-4 font-semibold text-sm w-1/5">Action</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr
                    key={getPredictionKey(p)}
                    className={`border-b hover:bg-gray-50 ${p.rejected ? "bg-red-50" : ""}`}
                  >
                    <td className="p-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <span>{p.title}</span>
                        {p.manual && (
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            Manual
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-800 font-semibold">
                      Rs. {p.amount}
                    </td>
                    <td
                      className="p-4 text-xs text-gray-400 truncate max-w-xs"
                      title={p.rawText}
                    >
                      {p.rawText}
                    </td>
                    <td className="p-4">
                      <select
                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${p.rejected ? "border-gray-200 bg-gray-100 text-gray-500" : !p.finalBudgetId ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                        value={p.finalBudgetId}
                        disabled={p.rejected}
                        onChange={(e) =>
                          handleBudgetChange(p.predictionLogId, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          -- Select a Budget --
                        </option>
                        {budgets.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.icon} {b.name}
                          </option>
                        ))}
                      </select>
                      {p.suggestedBudgetId &&
                        p.suggestedBudgetId == p.finalBudgetId && (
                          <span className="text-xs text-green-600 mt-1 block">
                            ✨ AI Matched
                          </span>
                        )}
                      {p.suggestedBudgetId &&
                        p.suggestedBudgetId != p.finalBudgetId &&
                        p.finalBudgetId !== "" && (
                          <span className="text-xs text-yellow-600 mt-1 block">
                            ✏️ User Edited
                          </span>
                        )}
                      {p.rejected && (
                        <span className="text-xs text-red-600 mt-1 block">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReject(p.predictionLogId)}
                        >
                          <XCircle className="mr-1" size={14} /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
