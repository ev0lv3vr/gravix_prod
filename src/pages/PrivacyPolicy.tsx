import { motion } from 'framer-motion';

export function PrivacyPolicy() {
    return (
        <main className="pt-24 pb-20 container-width px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-gravix-steel/30 bg-gravix-slate/30 backdrop-blur-sm">
                    <span className="text-sm font-medium text-gravix-gray-400 tracking-wide uppercase">Legal</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-8">Privacy Policy</h1>

                <div className="prose prose-invert prose-lg max-w-none text-gravix-gray-400">

                    <h2 className="text-white mt-12 mb-4 text-2xl font-bold">1. Introduction</h2>
                    <p>
                        GRAVIX™ ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h2 className="text-white mt-12 mb-4 text-2xl font-bold">2. Data We Collect</h2>
                    <p>
                        We may collect, use, store, and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, and title.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address, and telephone numbers.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                        <li><strong>Usage Data</strong> includes information about how you use our website, products, and services.</li>
                    </ul>

                    <h2 className="text-white mt-12 mb-4 text-2xl font-bold">3. How We Use Your Data</h2>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal obligation.</li>
                    </ul>

                    <h2 className="text-white mt-12 mb-4 text-2xl font-bold">4. Data Security</h2>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <h2 className="text-white mt-12 mb-4 text-2xl font-bold">5. Contact Us</h2>
                    <p>
                        If you have any questions about this privacy policy or our privacy practices, please contact us via the forms available on our website.
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
