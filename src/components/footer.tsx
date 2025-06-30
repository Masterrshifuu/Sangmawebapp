import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t mt-auto hidden md:block">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <Logo />
        <nav className="flex gap-4 mt-4 sm:mt-0">
          <Link href="/" className="text-sm hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/track-order" className="text-sm hover:text-primary transition-colors">
            Track Order
          </Link>
        </nav>
      </div>
    </footer>
  );
}
