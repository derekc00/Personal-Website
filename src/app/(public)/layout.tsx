import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}