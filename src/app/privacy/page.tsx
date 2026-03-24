import { Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Static legal page: Cache for 1 hour
export const revalidate = 3600;
export const runtime = 'edge';

const sections = [
  { id: 'data-collection', title: 'Data Collection' },
  { id: 'use-of-data', title: 'How We Use Data' },
  { id: 'data-sharing', title: 'Data Sharing' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'security', title: 'Security' },
  { id: 'contact', title: 'Contact Us' },
];

export default function PrivacyPolicy() {
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
          <span className="text-zinc-900">Privacy Policy</span>
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="ty-hero font-black text-zinc-900 mb-4">Privacy Policy</h1>
              <p className="ty-caption text-zinc-400 mb-12">Last updated: March 20, 2026</p>

              <div className="prose prose-zinc max-w-none space-y-16">
                <section id="data-collection">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">1. Data Collection</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      We collect information that you provide directly to us when you use our services. This includes when you create an account, list a property, fill out a contact form, or communicate with us.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Name and contact information (email, phone number)</li>
                      <li>Property details and preferences</li>
                      <li>Location data when searching for nearby properties</li>
                      <li>Communication history with our platform and agents</li>
                    </ul>
                  </div>
                </section>

                <section id="use-of-data">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">2. How We Use Data</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      Your data helps us provide a seamless property discovery experience. We use your information to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Personalize your search results based on preferences</li>
                      <li>Facilitate communication between buyers, sellers, and agents</li>
                      <li>Analyze platform performance and improve our features</li>
                      <li>Protect against fraudulent or illegal activity</li>
                    </ul>
                  </div>
                </section>

                <section id="data-sharing">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">3. Data Sharing</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      We do not sell your personal data to third parties. We only share information in the following circumstances:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>With authorized agents when you request a consultation or viewing</li>
                      <li>With service providers who assist in our operations (e.g., hosting, analytics)</li>
                      <li>When required by law or to protect our legal rights</li>
                    </ul>
                  </div>
                </section>

                <section id="cookies">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">4. Cookies & Tracking</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      We use cookies and similar technologies to remember your preferences and understand how you interact with our platform. You can manage your cookie settings through your browser at any time.
                    </p>
                  </div>
                </section>

                <section id="your-rights">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">5. Your Rights</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      You have the right to access, correct, or delete your personal data. If you wish to exercise any of these rights, please contact our privacy team.
                    </p>
                  </div>
                </section>

                <section id="security">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">6. Security</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      We implement industry-standard security measures to protect your data from unauthorized access or disclosure. However, no internet-based service is 100% secure.
                    </p>
                  </div>
                </section>

                <section id="contact">
                  <h2 className="ty-display font-bold text-zinc-900 mb-6">7. Contact Us</h2>
                  <div className="space-y-4 text-zinc-600 ty-body">
                    <p>
                      If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <p className="font-bold text-zinc-900">
                      privacy@mylistings.in<br />
                      Legal Department, MyListings
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
