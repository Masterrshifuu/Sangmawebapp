
import SearchHeader from '@/components/SearchHeader';

export default function RefundPolicyPage() {
  return (
    <>
      <SearchHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-4">
          Refund & Cancellation Policy
        </h1>
        <div className="prose prose-lg max-w-none space-y-4">
          <div>
            <h2 className="text-xl font-semibold font-headline">Cancellations</h2>
            <p>
              You can cancel your order free of charge within{' '}
              <strong>5 minutes</strong> of placing it. After 5 minutes, the
              order is considered confirmed and cannot be canceled as our team
              has already started preparing it for dispatch.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold font-headline">
              Refunds for Wrong or Damaged Items
            </h2>
            <p>
              If you receive a wrong or damaged item, please contact our
              support within <strong>60 minutes</strong> of delivery with a
              photo of the item. We will provide a full refund for that item to
              your original payment method or as store credit. Due to the
              perishable nature of groceries, we cannot accept refund requests
              made after 60 minutes.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold font-headline">
              Refunds for Missing Items
            </h2>
            <p>
              If an item is missing from your order, please notify us within 60
              minutes. After a quick verification with our packing records, we
              will issue a refund for the missing item.
            </p>
          </div>
           <div>
            <h2 className="text-xl font-semibold font-headline">No Refunds For</h2>
            <p>
              We do not offer refunds if you entered an incorrect delivery address or were unavailable to receive the order. We also do not accept returns or offer refunds for items you ordered by mistake or no longer want after delivery.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
