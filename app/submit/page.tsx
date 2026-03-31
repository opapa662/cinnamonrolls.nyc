import Header from "@/components/Header";
import SubmitForm from "./SubmitForm";
import { supabase } from "@/lib/supabase";

export default async function SubmitPage() {
  const { count } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <Header count={count ?? 0} backLink />
      <div style={{ paddingTop: "60px", paddingBottom: "36px" }}>
        <SubmitForm />
      </div>
    </div>
  );
}
