import Header from "@/components/Header";
import MapWrapper from "@/components/MapWrapper";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { count } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  return (
    <>
      <Header count={count ?? 0} />
      <main
        className="fixed inset-x-0 bottom-0"
        style={{ top: "52px" }}
      >
        <MapWrapper />
      </main>
    </>
  );
}
