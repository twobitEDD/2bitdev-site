import { redirect } from "next/navigation";

// Redirect old /serv-random to new /random explorer
export default function ServRandomRedirect() {
  redirect("/random");
}
