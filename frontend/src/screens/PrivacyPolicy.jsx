import React from 'react';

export default function PrivacyPolicy() {
  const EFFECTIVE_DATE = '15 September 2025'; // TODO: update when you ship changes

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* TOC */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">On this page</h2>
            <nav className="space-y-2 text-sm">
              {[
                ['who-we-are', 'Who We Are'],
                ['what-we-collect', 'Personal Data We Collect'],
                ['purposes-legal-bases', 'Purposes & Legal Bases'],
                ['cookies', 'Cookies & Similar Tech'],
                ['sharing', 'How We Share Data'],
                ['transfers', 'International Transfers'],
                ['retention', 'Retention'],
                ['rights', 'Your Rights'],
                ['children', 'Children’s Privacy'],
                ['security', 'Security'],
                ['automated', 'Automated Decisions'],
                ['changes', 'Changes'],
                ['contact', 'Contact & Complaints'],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-gray-700 hover:text-blue-700"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-8 xl:col-span-9">
          <div className="bg-white shadow-md rounded-lg p-8">
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-sm text-gray-500 mt-2">Effective date: {EFFECTIVE_DATE}</p>
            </header>

            <p className="mb-8 text-gray-700">
              At <strong>Voices on Canvas</strong> (“we”, “us”, “our”), we value the privacy and security of your
              personal data. This Privacy Policy explains what we collect, how we use and share it, and the rights
              available to you. This Policy is intended to meet major privacy regimes including GDPR/UK-GDPR,
              CPRA/CCPA, and Nigeria’s NDPR.
            </p>

            <section id="who-we-are" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">1) Who We Are</h2>
              <p className="text-gray-700">
                <strong>Data Controller:</strong> <span className="underline">{"{TODO: Legal Entity Name}"}</span>,{" "}
                <span className="underline">{"{TODO: Registered Address, Country}"}</span>. Contact:
                {" "}
                <a href="mailto:privacy@voicesoncanvas.com" className="text-blue-600 hover:underline">
                  privacy@voicesoncanvas.com
                </a>.
              </p>
              <p className="text-gray-700 mt-2">
                This Policy applies to our website, apps, and marketplace services (the “Services”).
              </p>
            </section>

            <section id="what-we-collect" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">2) Personal Data We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Provided by you:</strong> name, email, phone, shipping/billing addresses, account credentials,
                  order details, support messages, preferences.
                </li>
                <li>
                  <strong>Automatically collected:</strong> device/browser type, IP address, approximate location,
                  pages viewed and actions taken, identifiers (cookies/SDKs), usage logs.
                </li>
                <li>
                  <strong>From third parties (where lawful):</strong> payment processors (payment tokens/status),
                  shipping partners (tracking), analytics/ads partners, optional social login providers.
                </li>
              </ul>
            </section>

            <section id="purposes-legal-bases" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">3) Purposes & Legal Bases</h2>
              <p className="text-gray-700 mb-3">
                We process personal data for the purposes below. For GDPR/UK-GDPR users, we also indicate the legal basis.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Account & transactions:</strong> create/manage your account, process orders, provide support
                  (<em>contract</em>).
                </li>
                <li>
                  <strong>Service operations & communications:</strong> service messages, updates, responding to inquiries
                  (<em>contract</em> / <em>legitimate interests</em>).
                </li>
                <li>
                  <strong>Fraud prevention & security:</strong> detect/prevent fraud and abuse, secure our Services
                  (<em>legitimate interests</em> / <em>legal obligation</em>).
                </li>
                <li>
                  <strong>Analytics & improvement:</strong> measure performance, improve features
                  (<em>legitimate interests</em>; consent where required for cookies).
                </li>
                <li>
                  <strong>Marketing:</strong> send offers and recommendations with your consent (you can withdraw at any time)
                  (<em>consent</em>).
                </li>
                <li>
                  <strong>Legal/compliance:</strong> tax, accounting, reporting, defense of claims
                  (<em>legal obligation</em> / <em>legitimate interests</em>).
                </li>
              </ul>
            </section>

            <section id="cookies" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">4) Cookies & Similar Technologies</h2>
              <p className="text-gray-700">
                We use cookies and similar technologies for authentication, analytics, and personalization. In regions
                {/* where required (EEA/UK), we obtain consent via a banner. For details and controls, see our{" "}
                <a href="/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</a>. California users
                can adjust choices at{" "}
                <a href="/privacy-choices" className="text-blue-600 hover:underline">Privacy Choices</a> (Do Not Sell/Share). */}
              </p>
            </section>

            <section id="sharing" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">5) How We Share Personal Data</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Service providers (processors):</strong> hosting, payments, shipping, email/SMS, analytics,
                  ads measurement—under confidentiality and data-processing terms.
                </li>
                <li>
                  <strong>Marketplace sellers:</strong> we share necessary order and delivery information with the
                  seller(s) you purchase from to fulfill your order.
                </li>
                <li>
                  <strong>Legal/compliance:</strong> courts, regulators, and law enforcement where required by law.
                </li>
                <li>
                  <strong>Business transfers:</strong> in connection with a merger, acquisition, or asset sale, per
                  applicable law.
                </li>
              </ul>
              <p className="text-gray-700 mt-3">
                We do <strong>not sell</strong> personal data. Certain analytics/advertising disclosures may be deemed
                “sharing” under California law;
              </p>
            </section>

            <section id="transfers" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">6) International Data Transfers</h2>
              <p className="text-gray-700">
                If data is transferred outside your country, we implement appropriate safeguards (e.g., EU Standard
                Contractual Clauses and additional measures where required). You may contact us to request information
                about relevant transfer safeguards.
              </p>
            </section>

            <section id="retention" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">7) Data Retention</h2>
              <p className="text-gray-700 mb-3">
                We retain personal data only as long as necessary for the purposes described above, then delete or
                anonymize it. Typical ranges include:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 border-b">Category</th>
                      <th className="text-left p-3 border-b">Typical Retention</th>
                      <th className="text-left p-3 border-b">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Account data', '{life of account} + {12–24 months}', 'For recordkeeping & support.'],
                      ['Order/transaction records', '{6–10 years}', 'To meet tax/accounting laws.'],
                      ['Marketing preferences', '{until you opt out} or {24 months inactivity}', 'You can unsubscribe anytime.'],
                      ['Support tickets', '{24–36 months}', 'To resolve and improve service.'],
                    ].map(([cat, dur, note]) => (
                      <tr key={cat} className="border-b">
                        <td className="p-3">{cat}</td>
                        <td className="p-3">{dur}</td>
                        <td className="p-3">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Actual periods may vary by law and context. We may retain limited information to comply with legal
                obligations or defend legal claims.
              </p>
            </section>

            <section id="rights" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">8) Your Rights</h2>
              <p className="text-gray-700 mb-3">
                Your rights depend on your location. To exercise any right, email{" "}
                <a href="mailto:privacy@voicesoncanvas.com" className="text-blue-600 hover:underline">
                  privacy@voicesoncanvas.com
                </a>. We may request information to verify your identity.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">EEA/UK (GDPR/UK-GDPR)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Access, rectification, erasure</li>
                    <li>Restriction and objection (incl. to profiling/legitimate interests)</li>
                    <li>Data portability</li>
                    <li>Withdraw consent at any time (where relied upon)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">California (CPRA/CCPA)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Know/access, delete, correct</li>
                    <li>
                      Opt-out of <em>selling/sharing</em> personal information; limit use of sensitive PI
                      
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Nigeria (NDPR)</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Right to be informed, access, rectification, erasure</li>
                  <li>Restriction, portability, and objection to processing</li>
                  <li>Contact the Nigeria Data Protection Bureau (NDPB) to lodge a complaint</li>
                </ul>
              </div>
              <p className="text-gray-700 mt-3">
                You can unsubscribe from marketing emails at any time via the link in the email or by contacting us.
              </p>
            </section>

            <section id="children" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">9) Children’s Privacy</h2>
              <p className="text-gray-700">
                Our Services are not directed to children under{" "}
                <span className="underline">{'{13/16, choose based on your markets}'}</span>. We do not knowingly
                collect personal data from children. If you believe a child has provided personal data to us, contact us
                and we will take appropriate steps to delete it.
              </p>
            </section>

            <section id="security" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">10) Security</h2>
              <p className="text-gray-700">
                We implement administrative, technical, and physical safeguards to protect personal data (e.g.,
                encryption in transit, access controls, monitoring). No system is 100% secure, but we continuously
                improve our practices.
              </p>
            </section>

            <section id="automated" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">11) Automated Decision-Making</h2>
              <p className="text-gray-700">
                We do not engage in automated decision-making that produces legal or similarly significant effects
                without human involvement. If this changes, we will provide required disclosures and options.
              </p>
            </section>

            <section id="changes" className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">12) Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Policy from time to time. We will post the updated effective date and, where
                required, provide additional notice or request consent.
              </p>
            </section>

            <section id="contact" className="mb-2">
              <h2 className="text-2xl font-semibold mb-4">13) Contact & Complaints</h2>
              <p className="text-gray-700">
                Email:{" "}
                <a href="mailto:privacy@voicesoncanvas.com" className="text-blue-600 hover:underline">
                  privacy@voicesoncanvas.com
                </a>
                .
              </p>
              <p className="text-gray-700 mt-2">
                You may also contact your local data protection authority (e.g., ICO in the UK, your EU supervisory
                authority, or the Nigeria Data Protection Bureau). We welcome the chance to resolve concerns directly.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
