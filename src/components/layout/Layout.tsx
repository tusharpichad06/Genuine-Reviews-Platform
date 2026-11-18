import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef8ff]">
      <Navbar />

      <main className="w-full overflow-x-hidden">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout;