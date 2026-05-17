"use client";
import React from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { budgetApi } from "@/lib/api-client";

function CreateBudget({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);

  const onCreateBudget = async () => {
    try {
      await budgetApi.create({
        name,
        amount: Number(amount),
        period: "MONTHLY",
        startDate: null,
        endDate: null,
      });

      refreshData();
      toast.success("Budget Created Successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create budget");
    }
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className="bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md h-[170px]">
            <h2 className="text-5xl">+</h2>
            <h2>Create New Budget</h2>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Budget?</DialogTitle>
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
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Budget Amount</h2>
                  <Input
                    type="number"
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
                onClick={() => onCreateBudget()}
                disabled={!(name && amount)}
                className="mt-5 w-full"
              >
                Create Budget
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
