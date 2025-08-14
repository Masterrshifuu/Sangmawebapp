import { SearchHeader } from '@/components/SearchHeader';

export default function LegalPoliciesPage() {
  return (
    <>
      <SearchHeader />
      <main className="flex justify-center items-start px-4 py-12 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl w-full">
          {/* Last Updated Badge */}
          <div className="flex justify-center mb-6">
            <span className="bg-yellow-400 text-black text-sm font-semibold px-4 py-1 rounded-full shadow-sm">
              Last Updated: 15 August 2025
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold font-headline mb-8 text-center text-gray-800">
            Privacy Policy, Terms & Conditions, and Refund & Cancellation Policy
          </h1>

          {/* Content */}
          <div className="prose prose-lg text-justify text-gray-700">

            {/* 1. Privacy Policy */}
            <h2 className="text-xl font-semibold text-gray-900">1. Privacy Policy</h2>
            <p>
              Sangma Megha Mart (“we,” “our,” or “us”) is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.
            </p>
            <h3 className="text-lg font-semibold text-gray-900">Information We Collect</h3>
            <ul>
              <li>Name, contact details, and address for order delivery.</li>
              <li>Order history, payment details, and feedback.</li>
              <li>Device and app usage data (e.g., location for delivery, crash logs).</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-900">How We Use Your Data</h3>
            <ul>
              <li>To process and deliver your orders.</li>
              <li>To improve our app and services.</li>
              <li>To communicate with you about orders, offers, and support.</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-900">Data Sharing</h3>
            <p>We do not sell your data. We may share necessary information with delivery partners, payment processors, or as required by law.</p>
            <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
            <p>Our app may request permissions such as location (for delivery), storage (for app caching), and camera (for product or issue photos). You can disable these in your device settings, but some features may not work.</p>
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            <p>We use encryption and secure servers to protect your data.</p>
            <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            <p>
              For privacy questions: <a href="mailto:martsangma126@gmail.com" className="text-blue-600 hover:underline">martsangma126@gmail.com</a>
            </p>

            {/* 2. Terms & Conditions */}
            <h2 className="text-xl font-semibold text-gray-900">2. Terms & Conditions</h2>
            <ul>
              <li>We aim for timely deliveries, but are not liable for delays due to traffic, weather, or unforeseen events.</li>
              <li>Products are subject to availability.</li>
              <li>You are responsible for providing a correct, safe delivery address.</li>
              <li>We reserve the right to refuse service or cancel orders if necessary.</li>
              <li>All transactions are subject to our Refund & Cancellation Policy.</li>
            </ul>

            {/* 3. Refund & Cancellation Policy */}
            <h2 className="text-xl font-semibold text-gray-900">3. Refund & Cancellation Policy</h2>
            <h3 className="text-lg font-semibold text-gray-900">Order Cancellations</h3>
            <p>You may cancel your order within 5 minutes of placing it for free. After 5 minutes, the order is confirmed and cannot be cancelled as preparation starts immediately.</p>

            <h3 className="text-lg font-semibold text-gray-900">Refunds for Wrong, Damaged, or Expired Items</h3>
            <p>If you receive a wrong, damaged, or expired item, notify us within 60 minutes of delivery with a photo. We will refund to your original payment method or provide store credit.</p>

            <h3 className="text-lg font-semibold text-gray-900">Refunds for Missing Items</h3>
            <p>Notify us within 60 minutes of delivery. After verification, we will refund the missing item.</p>

            <h3 className="text-lg font-semibold text-gray-900">Returns or Replacements for Mistaken Orders</h3>
            <p>If you ordered the wrong item, you may request a return or replacement. Additional delivery charges may apply for pick-up and re-delivery.</p>

            <h3 className="text-lg font-semibold text-gray-900">Incorrect Address or Missed Delivery</h3>
            <p>
              If the address provided is wrong and delivery must be re-routed, extra charges may apply based on distance. <br />
              If you are unavailable to receive the order and do not inform us in advance, you may:
            </p>
            <ul>
              <li>Pick up the order from our store, OR</li>
              <li>Schedule a second delivery (additional delivery charges may apply if the delivery person must go twice).</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900">Contact for Refunds & Support</h3>
            <p>Email: <a href="mailto:martsangma126@gmail.com" className="text-blue-600 hover:underline">martsangma126@gmail.com</a></p>

          </div>
        </div>
      </main>
    </>
  );
}
