"use client";

import React, { useState, useEffect } from "react";
import { statementApi, formatDateDDMMYYYY } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader, Upload, ArrowRight, FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StatementsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await statementApi.getRequests();
      setRequests(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [".csv", ".pdf", ".png", ".jpg", ".jpeg"];
    const isValid = validTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!isValid) {
      toast.error("Please upload a valid CSV, PDF, or Image file");
      return;
    }

    setUploading(true);
    try {
      await statementApi.upload(file);
      toast.success(
        "Statement uploaded successfully and queued for processing.",
      );
      fetchRequests(); // Refresh list immediately
    } catch (error) {
      toast.error(error.message || "Failed to upload statement");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Confirmed
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Rejected
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Completed
          </span>
        );
      case "FAILED":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Failed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse">
            Processing
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-8">
      <h2 className="font-bold text-3xl mb-8">Statement Uploads</h2>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl border-dashed border-2 border-blue-200 shadow-sm mb-8 flex flex-col items-center justify-center h-48">
        <FileText size={40} className="text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Upload your bank statement
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Upload a CSV, PDF, or Image. Our AI will automatically categorize your
          expenses.
        </p>

        <div>
          <input
            type="file"
            accept=".csv,.pdf,image/png,image/jpeg,image/jpg"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button
            className="cursor-pointer"
            disabled={uploading}
            onClick={() => document.getElementById("file-upload").click()}
          >
            {uploading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} /> Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2" size={16} /> Choose File
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xl">Processing History</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No statement requests found. Upload a file to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="p-4 font-semibold text-sm">Date</th>
                  <th className="p-4 font-semibold text-sm">File Name</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {formatDateDDMMYYYY(request.createdAt)}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {request.fileName}
                    </td>
                    <td className="p-4">{getStatusBadge(request.status)}</td>
                    <td className="p-4 text-right">
                      {request.status === "COMPLETED" ? (
                        <Link href={`/dashboard/statements/${request.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            Review & Confirm{" "}
                            <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </Link>
                      ) : request.status === "CONFIRMED" ? (
                        <span className="text-emerald-600 text-sm font-medium">
                          Confirmed
                        </span>
                      ) : request.status === "REJECTED" ? (
                        <span className="text-rose-600 text-sm font-medium">
                          Rejected
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Waiting...
                        </span>
                      )}
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
