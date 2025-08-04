
import SearchHeader from '@/components/SearchHeader';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <SearchHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-4">
          Terms & Conditions
        </h1>
        <div className="prose prose-lg max-w-none">
          <p>
            Welcome to Sangma Megha Mart! By using our app, you agree to these
            terms. We promise to deliver your groceries quickly but are not
            liable for minor delays due to traffic or weather. All products are
            subject to availability. We reserve the right to refuse service or
            cancel orders at our discretion. You are responsible for providing a
            correct and safe delivery address. All payments are final as per our{' '}
            <Link href="/refund-policy" className="text-blue-600 hover:underline">
                Refund Policy
            </Link>
            .
          </p>
          {/* Add more detailed terms here */}
        </div>
      </main>
    </>
  );
}
