import { FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Static legal page: Cache for 1 hour

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'service-description', title: 'Description of Service' },
  { id: 'user-conduct', title: 'User Conduct' },
  { id: 'property-listings', title: 'Property Listings' },
  { id: 'referral-program', title: 'Referral Program' },
  { id: 'limitation-of-liability', title: 'Limitation of Liability' },
  { id: 'modifications', title: 'Modifications to Service' },
];

export default function TermsOfConditions() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
        {/* Breadcrumbs */}
        <div className="mb-12 flex items-center gap-2 text-zinc-400 ty-label">
          <Link href="/" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-900 uppercase">Terms of Conditions</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Table of Contents - Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-1 p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
              <h3 className="ty-label text-zinc-400 mb-6 px-2">On this page</h3>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-2 py-2.5 ty-caption font-bold text-zinc-500 hover:text-zinc-900 transition-colors border-l-2 border-transparent hover:border-zinc-200"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 max-w-3xl">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 shadow-xl shadow-zinc-200 mb-8">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="ty-hero font-black text-zinc-900 mb-4 uppercase">Terms of Conditions</h1>
              <p className="ty-caption text-zinc-400 mb-12 uppercase">Last updated: March 20, 2026</p>

              <div className="prose prose-zinc max-w-none space-y-16">
                <section id="acceptance">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">1. Acceptance of Terms</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      By accessing and using this platform, you agree to be bound by these Terms of Conditions. If you do not agree to all terms, please do not use our services.
                    </p>
                  </div>
                </section>

                <section id="service-description">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">2. Description of Service</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      MyListings provides a platform for listing, searching, and consulting on real estate properties. We act as a facilitator and matchmaker between interested parties.
                    </p>
                  </div>
                </section>

                <section id="user-conduct">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">3. User Conduct</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      Users may not:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Provide false or misleading information in listings or profiles</li>
                      <li>Use the service for any illegal or unauthorized purpose</li>
                      <li>Interfere with or disrupt the operation of the service</li>
                    </ul>
                  </div>
                </section>

                <section id="property-listings">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">4. Property Listings</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      While we strive for accuracy, MyListings does not guarantee the availability, pricing, or condition of properties listed. All details should be verified independently.
                    </p>
                  </div>
                </section>

                <section id="referral-program">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">5. Referral Program</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      Our "Refer and Earn" program is subject to specific conditions. Eligibility depends on property value (usually over ₹1 Crore) and successful deal closure through our network.
                    </p>
                  </div>
                </section>

                <section id="limitation-of-liability">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">6. Limitation of Liability</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      MyListings shall not be liable for any direct, indirect, or incidental damages arising out of your use or inability to use the service.
                    </p>
                  </div>
                </section>

                <section id="modifications">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">7. Modifications to Service</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      We reserve the right to modify or discontinue any part of our service at any time without notice.
                    </p>
                  </div>
                </section>

                <section id="contact">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6 uppercase">8. Contact Us</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      For legal inquiries, please contact:
                    </p>
                    <p className="font-bold text-zinc-900">
                      legal@mylistings.in<br />
                      Compliance Department, MyListings
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
