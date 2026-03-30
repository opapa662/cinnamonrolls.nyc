import Header from "@/components/Header";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        <MapWrapper />
      </main>
    </div>
  );
}
