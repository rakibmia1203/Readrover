import { redirect } from "next/navigation";

// Legacy route kept for backward compatibility.
// The feature was replaced by the Discover experience.
export default function SyllabusPackRedirect() {
  redirect("/discover");
}
