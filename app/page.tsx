import Header from "@/components/Header";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <>
      <Header />
      <main
        className="fixed inset-x-0 bottom-0"
        style={{ top: "52px" }}
      >
        <MapWrapper />
      </main>
    </>
  );
}
