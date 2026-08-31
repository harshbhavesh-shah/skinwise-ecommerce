"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium hover:bg-bg-2"
    >
      Log out
    </button>
  );
}
