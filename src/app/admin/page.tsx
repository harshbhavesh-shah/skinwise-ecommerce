import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";

export default async function AdminIndexPage() {
  redirect((await isAdminAuthed()) ? "/admin/orders" : "/admin/login");
}
