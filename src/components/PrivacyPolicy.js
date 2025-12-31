import React from 'react';
import Header from './Header';
import { motion } from 'framer-motion';
import { Lock, Database, Eye, Server } from 'lucide-react';

const PrivacyPolicy = ({ user, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
            <div className="sticky top-4 z-30 px-2 sm:px-6 mb-8">
                <Header
                    title="Privacy Policy"
                    description="Your privacy is our highest priority."
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
            </div>

            <div className="relative w-full max-w-4xl mx-auto bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-slate-300 p-8 sm:p-12">

                <div className="space-y-8">
                    <section className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <Database className="text-amber-500 mb-3" size={24} />
                            <h4 className="text-lg font-semibold text-white mb-2">Data Collection</h4>
                            <p className="text-sm text-slate-400">We collect medical records, personal details, and usage data only to provide our portfolio and analysis services.</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <Server className="text-emerald-500 mb-3" size={24} />
                            <h4 className="text-lg font-semibold text-white mb-2">Secure Storage</h4>
                            <p className="text-sm text-slate-400">All health data is encrypted at rest and in transit using military-grade AES-256 encryption protocols.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            1. Information We Collect
                        </h3>
                        <p className="leading-relaxed mb-4">
                            When you use Curebird, we may collect:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-sky-500">
                            <li><strong>Personal Identity Information:</strong> Name, email address, date of birth.</li>
                            <li><strong>Medical Records:</strong> Lab results, prescriptions, imaging reports, and doctor's notes uploaded by you.</li>
                            <li><strong>Generated Health Data:</strong> Insights and summaries produced by our AI algorithms based on your records.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">2. How We Use Your Data</h3>
                        <p className="leading-relaxed">
                            Your data is used strictly for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2 marker:text-sky-500">
                            <li>Providing personalized medical portfolio management.</li>
                            <li>Running AI analysis to offer health insights (Cure Analyzer).</li>
                            <li>Communicating imperative account updates or security alerts.</li>
                        </ul>
                        <p className="mt-4 text-sky-200 bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
                            We do <strong>NOT</strong> sell your personal health information to third-party advertisers or data brokers.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">3. AI Processing</h3>
                        <p className="leading-relaxed">
                            Our AI models process your data to provide insights. While we strive for accuracy, AI processing acts as a tool for organization and preliminary analysis, not a definitive diagnosis.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">4. Third-Party Sharing</h3>
                        <p className="leading-relaxed">
                            We only share data with trusted cloud infrastructure providers (like Google Cloud) strictly necessary to operate our service. All providers are vetted for high security standards.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">5. User Rights</h3>
                        <p className="leading-relaxed">
                            You have the right to access, download, correct, or permanently delete your data at any time via your account settings.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
