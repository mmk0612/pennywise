"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@/lib/auth-client";
import Link from "next/link";
function Header() {
  const { user, isSignedIn } = useUser();
  return (
    <div className="p-3 flex justify-between items-center shadow-sm bg-blue-600">
      <Image src={"/logo.png"} alt="logo" width={"160"} height={"100"} />
      {isSignedIn ? (
        <UserButton />
      ) : (
        <Link href={"/sign-in"}>
          <Button>Get Started</Button>
        </Link>
      )}
    </div>
  );
}

export default Header;
