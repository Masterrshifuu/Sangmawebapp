import { SearchHeader } from '@/components/SearchHeader';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <SearchHeader />
      <main className="flex justify-center items-start px-4 py-12 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl w-full">
          {/* Effective Date Badge */}
          <div className="flex justify-center mb-6">
            <span className="bg-yellow-400 text-black text-sm font-semibold px-4 py-1 rounded-full shadow-sm">
              Effective Date: 15/08/25
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold font-headline mb-8 text-center text-gray-800">
            Terms & Conditions
          </h1>

          {/* Terms Text */}
          <div className="prose prose-lg text-justify text-gray-700">
            <p>
              Welcome to Sangma Megha Mart! By downloading or using our app, you agree
              to these terms. Please read them carefully.
            </p>

            <p>
              <strong>Service Commitment:</strong> We aim to deliver groceries quickly
              and in good condition. However, delivery times may vary due to traffic,
              weather, or other factors beyond our control.
            </p>

            <p>
              <strong>Product Availability:</strong> All products are subject to
              availability. If an item is unavailable after you place your order, we
              will notify you and may offer an alternative or refund as per our Refund &
              Cancellation Policy.
            </p>

            <p>
              <strong>Order Accuracy:</strong> You are responsible for providing a
              correct and complete delivery address and being available to receive your
              order. Incorrect addresses or unavailability at the time of delivery may
              result in cancellation without refund.
            </p>

            <p>
              <strong>Payments:</strong> All payments are processed securely. By placing
              an order, you agree to pay the listed prices, including applicable taxes
              and delivery charges. Payments are final and subject to our Refund &
              Cancellation Policy.
            </p>

            <p>
              <strong>User Responsibilities:</strong> You agree not to misuse the app,
              attempt to disrupt its operation, or engage in fraudulent activities.{' '}
              <Link href="/refund-policy" className="text-blue-600 hover:underline">
                Refund Policy
              </Link>
              .
            </p>

            <p>
              <strong>Service Changes:</strong> We may update, modify, or suspend the
              app or services at any time without prior notice.
            </p>

            <p>
              <strong>Limitation of Liability:</strong> We are not liable for indirect,
              incidental, or consequential damages. Our total liability in any case will
              be limited to the amount you paid for the order in question.
            </p>

            <p>
              <strong>Governing Law:</strong> These terms are governed by the laws of
              India.
            </p>

            <p>
              For more details, please review our Privacy Policy and Refund &
              Cancellation Policy.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
