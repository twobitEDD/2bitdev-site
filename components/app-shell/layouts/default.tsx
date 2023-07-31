import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { Navbar } from "../navbar";
import { Head } from "./head";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Head />
      <Navbar />
      <main className="container flex-grow">{children}</main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-center w-full py-3">
      <Link
        className="flex items-center gap-1 text-current"
        href="/"
        title="homepage"
      >
        <span className="text-default-600">Powered by</span>
        <p className="text-primary"> {siteConfig.name}</p>
      </Link>
    </footer>
  );
}
