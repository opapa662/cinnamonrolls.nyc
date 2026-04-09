import type { Metadata } from "next";
import Header from "@/components/Header";
import SubmitForm from "./SubmitForm";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Add or Edit a Spot — cinnamonrolls.nyc",
  description: "Know a great cinnamon roll spot in NYC that's missing from the map? Suggest a new addition or an edit to an existing listing.",
  alternates: { canonical: "https://cinnamonrolls.nyc/submit" },
  openGraph: {
    title: "Add or Edit a Spot — cinnamonrolls.nyc",
    description: "Suggest a new cinnamon roll spot or edit an existing one on cinnamonrolls.nyc.",
    url: "https://cinnamonrolls.nyc/submit",
  },
};

export default async function SubmitPage() {
  const { count } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("visible", true);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cr-cream)", fontFamily: "var(--font-inter), -apple-system, sans-serif" }}>
      <Header count={count ?? 0} backLink />
      <div style={{ paddingTop: "60px", paddingBottom: "36px" }}>
        <SubmitForm />
      </div>
    </div>
  );
}
