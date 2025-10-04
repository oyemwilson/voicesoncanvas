import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function HelpFAQ() {
  const [tab, setTab] = useState('about'); // 'about' | 'selling' | 'buying'
  const [q, setQ] = useState('');
  const [open, setOpen] = useState({}); // {questionKey: boolean}

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  // ---------- DATA ----------
  const aboutFaq = [
    {
      q: 'Original Paintings – Are They Framed?',
      a: (
        <>
          At Voices on Canvas, original paintings may or may not come framed depending on the
          artist’s preference. Check the product description for each artwork to see if it is framed or unframed.
          For unframed pieces, we recommend using a professional framer to protect and present the work.
        </>
      ),
    },
    {
      q: 'Can I Copy Or Use Any Of The Content On Your Site?',
      a: (
        <>
          No. Copying or using content (images, text, listings) without express permission is prohibited.
          This protects artists’ copyrights. If you wish to license any content, please contact us at{' '}
          <a className="text-blue-600 hover:underline" href="mailto:support@voicesoncanvas.com">
            support@voicesoncanvas.com
          </a>.
        </>
      ),
    },
    {
      q: 'What Countries In Africa Are Your Artists And Artworks From?',
      a: (
        <>
          We showcase a wide range of African and diasporan artists. While our focus is African art and
          communities, we collaborate globally with creators and galleries who share our standards for ethical,
          sustainable practice and celebration of African cultural heritage.
        </>
      ),
    },
    {
      q: 'What Kind Of Artworks Do You Sell?',
      a: (
        <>
          We feature paintings, prints, sculptures, photography, mixed media, and more—spanning traditional to
          contemporary styles. You’ll find abstract and representational works in varied themes, sizes, and budgets.
        </>
      ),
    },
    {
      q: 'Are Your Artworks Original?',
      a: (
        <>
          Yes. Listings clearly state whether a piece is an original, a print, or a limited edition. We curate for
          authenticity so you can buy with confidence.
        </>
      ),
    },
    {
      q: 'How Often Do You Update Your Inventory?',
      a: (
        <>
          Frequently. As a marketplace, new works are added by artists and partner galleries on an ongoing basis.
          For updates, browse often or subscribe to our newsletter.
        </>
      ),
    },
    {
      q: 'How Closely Do Website Images Match The Actual Artwork?',
      a: (
        <>
          We aim for accurate representation, but colors can vary by screen and lighting. Texture and fine details
          may be richer in person. Questions? Contact us before purchasing—our return/dispute policy offers
          protection if a work is materially not as described.
        </>
      ),
    },
    {
      q: 'How does my purchase support your artists?',
      a: (
        <>
          Purchases directly support artists and their communities through fair, transparent pricing. Your support
          sustains cultural heritage while funding new work.
        </>
      ),
    },
    {
      q: 'How do you ensure that artists receive fair compensation?',
      a: (
        <>
          We implement fair-commission structures, transparent payouts, and seller dashboards. Works are only listed
          upon artist/gallery approval and clear pricing. Payouts follow successful delivery/confirmation.
        </>
      ),
    },
    {
      q: 'What other ways can I support artists besides making a purchase?',
      a: (
        <>
          Follow and share artists’ profiles, join newsletters, leave reviews, and commission works. Visibility and
          feedback help artists grow.
        </>
      ),
    },
    {
      q: 'Can I communicate directly with the artist who created my piece?',
      a: (
        <>
          For order questions, use the order messaging/dispute tools. For commissions or collaboration inquiries,
          email{' '}
          <a className="text-blue-600 hover:underline" href="mailto:support@voicesoncanvas.com">
            support@voicesoncanvas.com
          </a>{' '}
          and we’ll facilitate where appropriate.
        </>
      ),
    },
    {
      q: 'Do you have a policy on ethical and sustainable sourcing of materials?',
      a: (
        <>
          We encourage ethical practices and reserve the right to remove listings that violate our standards.
          Artists must comply with our Seller Guidelines and applicable laws. (See{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">Privacy</Link>.)
        </>
      ),
    },
    {
      q: 'How can I contact you with a question?',
      a: (
        <>
          Email{' '}
          <a className="text-blue-600 hover:underline" href="mailto:support@voicesoncanvas.com">
            support@voicesoncanvas.com
          </a>
          . Include your order number (if applicable) for faster help.
        </>
      ),
    },
  ];

  const sellingFaq = [
    {
      q: 'How can I update my account information or artist profile?',
      a: (
        <>
          Click the human/profile icon (top-right) &rarr; “Artist Profile”. Update your bio, location, and details,
          then save.
        </>
      ),
    },
    {
      q: 'Can I use a pseudonym or artist name on my profile?',
      a: (
        <>
          No. For trust and verification, we currently require real names. You may include your artist/studio name in
          your bio and listings.
        </>
      ),
    },
    {
      q: 'Can I add or change my profile picture?',
      a: (
        <>
          Yes. From the profile page, upload a clear headshot or representative image. You can change it anytime.
        </>
      ),
    },
    {
      q: 'How can i become an artist and list products?',
      a: (
        <>
          Request seller access from the profile (human) icon &rarr; “Request Seller”. Upload photo, bio, name, and
          location. Once approved by our team, you’ll see “Upload Art” in your navbar. Submissions go through admin
          review before listing.
        </>
      ),
    },
    {
      q: 'How do I ensure my listings comply with platform guidelines?',
      a: (
        <>
          Follow our Seller Guidelines: accurate titles/descriptions, truthful condition, clear pricing, original
          media, and proper rights. Listings may be rejected/removed if they violate policy or law.
        </>
      ),
    },
    {
      q: 'How do I protect my artwork from unauthorised use?',
      a: (
        <>
          Use high-quality but watermarked previews where appropriate, avoid uploading print-ready files, and include
          copyright notices. Report infringements to{' '}
          <a className="text-blue-600 hover:underline" href="mailto:legal@voicesoncanvas.com">
            legal@voicesoncanvas.com
          </a>.
        </>
      ),
    },
  ];

  const buyingFaq = [
    { q: 'What is an original artwork?', a: 'A one-of-a-kind piece created by the artist (not a reproduction).' },
    { q: 'What is a limited edition artwork?', a: 'A finite run of identical prints/casts—each numbered and often signed.' },
    {
      q: 'How can I buy artwork on your website?',
      a: (
        <>
          Add to cart and complete checkout. You’ll receive order confirmation and shipping updates. Questions? Contact
          us before purchase.
        </>
      ),
    },
    {
      q: 'Can I negotiate the prices of an artwork?',
      a: 'No. Prices are set by the artist/seller. We do not support price negotiation on the platform.',
    },
    {
      q: 'I like an artist’s work. Can I commission a custom project?',
      a: (
        <>
          Yes—email{' '}
          <a className="text-blue-600 hover:underline" href="mailto:support@voicesoncanvas.com">
            support@voicesoncanvas.com
          </a>{' '}
          with details; we’ll help coordinate where possible.
        </>
      ),
    },
    {
      q: 'What do I do if I have an issue with payment or checkout?',
      a: (
        <>
          Try another card or payment method, clear cache, and ensure billing details match. If issues persist, contact
          support with screenshots/error codes.
        </>
      ),
    },
    {
      q: 'How to initiate a return or dispute?',
      a: (
        <>
          Open a dispute from your order page within the stated window. Provide photos and details; our team will
          review and coordinate with the seller.
        </>
      ),
    },
    {
      q: 'Are there any discounts or promotions available?',
      a: 'Discounts are at the artist/seller’s discretion. Follow artists or join our newsletter for promotions.',
    },
    {
      q: 'What forms of payments do you accept?',
      a: 'PayPal, Paystack, and supported debit/credit cards.',
    },
    {
      q: 'What security measures are in place for payments?',
      a: 'All payments are processed via PCI-compliant gateways with encryption in transit and fraud screening.',
    },
    { q: 'Is your checkout process secure?', a: 'Yes. We use HTTPS/TLS and reputable payment providers.' },
    { q: 'Do you store my payment information on your servers?', a: 'No. Payment details are tokenized and handled by our processors.' },
    { q: 'After purchasing artwork, what is the next step?', a: 'The seller prepares and ships your order; you’ll receive tracking details.' },
    {
      q: 'What should I do if I notice suspicious activity on my payment account?',
      a: 'Contact your bank immediately and notify us so we can review recent activity on your account/orders.',
    },
  ];

  const tabs = [
    { key: 'about', label: 'About VOC', data: aboutFaq },
    { key: 'selling', label: 'Selling Art', data: sellingFaq },
    { key: 'buying', label: 'Buying Art', data: buyingFaq },
  ];

  // ---------- FILTER ----------
  const active = useMemo(() => tabs.find((t) => t.key === tab), [tab]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return active.data;
    return active.data.filter(
      (item) =>
        item.q.toLowerCase().includes(term) ||
        (typeof item.a === 'string'
          ? item.a.toLowerCase().includes(term)
          : // stringify JSX children minimally
            JSON.stringify(item.a).toLowerCase().includes(term))
    );
  }, [active, q]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Help & FAQ</h1>
          <p className="text-gray-600 mt-2">Find quick answers about Voices on Canvas.</p>

          {/* Search */}
          <div className="mt-6">
            <label htmlFor="faq-search" className="sr-only">Search FAQs</label>
            <div className="relative">
              <input
                id="faq-search"
                type="text"
                placeholder="Search help topics..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.6-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`pb-3 text-sm font-medium border-b-2 ${
                  tab === t.key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          {filtered.length === 0 && (
            <p className="text-sm text-gray-500 p-4">No results. Try a different keyword.</p>
          )}

          <ul className="divide-y divide-gray-100">
            {filtered.map((item, idx) => {
              const key = `${tab}-${idx}-${item.q}`;
              const isOpen = !!open[key];
              return (
                <li key={key} className="py-3">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between text-left"
                    aria-expanded={isOpen}
                    aria-controls={`${key}-panel`}
                  >
                    <span className="font-medium text-gray-900">{item.q}</span>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div id={`${key}-panel`} className="mt-2 text-sm text-gray-700 leading-relaxed">
                      {typeof item.a === 'string' ? <p>{item.a}</p> : item.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Need more help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Still need help? Email{' '}
            <a className="text-blue-600 hover:underline" href="mailto:support@voicesoncanvas.com">
              support@voicesoncanvas.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
