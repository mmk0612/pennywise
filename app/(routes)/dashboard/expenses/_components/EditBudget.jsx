"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader, PenBox } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { budgetApi } from "@/lib/api-client";

function EditBudget({ budget, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budget?.icon);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  const [name, setName] = useState(budget?.name);
  const [amount, setAmount] = useState(budget?.amount);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (budget) {
      setEmojiIcon(budget?.icon);
      setName(budget?.name);
      setAmount(budget?.amount);
    }
  }, [budget]);
  const onUpdateBudget = async () => {
    setLoading(true);
    try {
      await budgetApi.update(budget.id, {
        name,
        amount: Number(amount),
        period: budget?.period || "MONTHLY",
        startDate: budget?.startDate || null,
        endDate: budget?.endDate || null,
      });

      setLoading(false);
      refreshData();
      toast.success("Budget Updated Successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update budget");
    }
    setLoading(false);
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex gap-2">
            {" "}
            <PenBox /> Edit Budget
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Existing Budget?</DialogTitle>
            <DialogDescription>
              <div className="mt-5">
                <Button
                  variant="outline"
                  onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                  className="text-lg"
                >
                  {emojiIcon}
                </Button>
                <div className="absolute z-20">
                  <EmojiPicker
                    open={openEmojiPicker}
                    onEmojiClick={(e) => {
                      setEmojiIcon(e.emoji);
                      setOpenEmojiPicker(false);
                    }}
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Budget Name</h2>
                  <Input
                    placeholder="e.g. Groceries"
                    defaultValue={budget?.name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Budget Amount</h2>
                  <Input
                    type="number"
                    defaultValue={budget?.amount}
                    placeholder="e.g. Rs.5000"
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                onClick={() => onUpdateBudget()}
                disabled={!(name && amount)}
                className="mt-5 w-full"
              >
                {loading ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Update Budget"
                )}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditBudget;
