import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-lg mx-auto px-5 py-12 space-y-8">
        <div>
          <Link href="/" className="text-[12px] font-semibold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">&larr; Back to app</Link>
          <h1 className="text-2xl font-bold tracking-tight mt-4">Privacy Policy</h1>
          <p className="text-[13px] text-black/40 dark:text-white/40 mt-1">Last updated: June 23, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-[15px] font-bold">What data we collect</h2>
          <p className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed">
            <strong>FlowFunds</strong> uses Google OAuth for authentication and stores your financial data in a secure MongoDB database. We collect:
          </p>
          <ul className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed space-y-2 list-disc pl-5">
            <li><span className="font-semibold text-black dark:text-white">Google profile</span> — your name, email, and profile picture for authentication purposes.</li>
            <li><span className="font-semibold text-black dark:text-white">Financial data</span> — transactions, debts, budgets, and investments you create within the app.</li>
            <li><span className="font-semibold text-black dark:text-white">Receipt images</span> — uploaded to Cloudinary for secure cloud storage.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-bold">How we use your data</h2>
          <ul className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed space-y-2 list-disc pl-5">
            <li>Your financial data is stored securely and is only accessible to you.</li>
            <li>AI features (voice input, text parsing, insights) are processed via third-party AI providers (Google Gemini or Groq) using server-side API keys. Your data is sent to these providers for processing only.</li>
            <li>We do not sell, share, or transfer your data to any third parties.</li>
            <li>We do not use your data for advertising or tracking purposes.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-bold">Data retention</h2>
          <p className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed">
            Your data is stored in our database as long as your account is active. You can delete your data at any time by contacting us. Signing out does not delete your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-bold">Open source</h2>
          <p className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed">
            FlowFunds is fully open source. You can inspect the entire codebase, verify exactly what data is collected and how it is used, and even self-host your own instance.
          </p>
          <a href="https://github.com/RITIKSINGH-DEOS/FlowFunds" target="_blank" rel="noopener noreferrer"
            className="block bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl p-4 text-[13px] font-semibold hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors">
            github.com/RITIKSINGH-DEOS/FlowFunds
          </a>
        </section>

        <section className="space-y-3">
          <h2 className="text-[15px] font-bold">Contact</h2>
          <p className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed">
            If you have any questions about this privacy policy or how your data is handled:
          </p>
          <div className="bg-black/[0.03] dark:bg-white/[0.05] rounded-2xl p-4 space-y-1.5">
            <p className="text-[13px] font-semibold">FlowFunds Team</p>
            <p className="text-[13px] text-black/50 dark:text-white/50">support@FlowFunds.app</p>
          </div>
        </section>
      </div>
    </div>
  );
}
