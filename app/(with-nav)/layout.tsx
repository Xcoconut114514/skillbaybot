import { Navbar } from "@/components/navbar";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="container mx-auto max-w-[1400px] pt-6 px-4 md:px-6 flex-grow">
        {children}
      </main>
    </div>
  );
}
