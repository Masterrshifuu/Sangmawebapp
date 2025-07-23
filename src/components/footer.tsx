
import Link from 'next/link';
import Logo from './logo';

const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center">
        <Logo />
        <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link href="/" className="text-sm hover:underline">
            Home
          </Link>
          <Link href="/track-order" className="text-sm hover:underline">
            Track Order
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
