import { FossBanner } from "@zephyr-ui/misc/foss-banner";
import { Database, Eye, LockKeyhole, Server, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Zephyr",
  description:
    "Privacy policy and data handling practices for Zephyr social media platform."
};

const PrivacyIcon = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="mb-2 flex items-center gap-2 text-primary">
    <Icon className="h-5 w-5" />
    <span className="font-medium">{title}</span>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-0">
      <div className="mb-8 flex items-center gap-3">
        <LockKeyhole className="h-8 w-8 text-primary" />
        <h1 className="font-bold text-3xl">Privacy Policy</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mt-8">
          <p className="text-lg text-muted-foreground">
            At Zephyr, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you use our platform.
          </p>
        </section>

        <section className="mt-8">
          <PrivacyIcon icon={Eye} title="Information We Collect" />
          <div className="mt-4 space-y-4">
            <h3 className="font-medium text-xl">1. Personal Information</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Name and username</li>
              <li>Email address</li>
              <li>Profile information</li>
              <li>Profile picture</li>
              <li>Social media connections</li>
              <li>Authentication data from third-party services</li>
            </ul>

            <h3 className="font-medium text-xl">2. Content Information</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Posts and comments</li>
              <li>Images and media uploads</li>
              <li>Reactions and interactions</li>
              <li>Messages and communications</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <PrivacyIcon icon={Database} title="How We Use Your Information" />
          <div className="mt-4 space-y-4">
            <p>We use the collected information for the following purposes:</p>

            <h3 className="font-medium text-xl">1. Service Provision</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Account creation and management</li>
              <li>Content delivery and display</li>
              <li>Feature functionality</li>
              <li>User authentication</li>
              <li>Communication services</li>
            </ul>

            <h3 className="font-medium text-xl">2. Platform Improvement</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Analytics and performance monitoring</li>
              <li>Feature development and optimization</li>
              <li>Bug fixing and troubleshooting</li>
              <li>User experience enhancement</li>
            </ul>

            {/* <h3 className="font-medium text-xl">3. Personalization</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Content recommendations</li>
              <li>User suggestions</li>
              <li>Customized feeds</li>
              <li>Relevant notifications</li>
            </ul> */}
          </div>
        </section>

        <section className="mt-8">
          <PrivacyIcon icon={Server} title="Data Storage and Protection" />
          <div className="mt-4 space-y-4">
            <h3 className="font-medium text-xl">1. Data Security</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>End-to-end encryption for sensitive data</li>
              <li>Regular security audits</li>
              <li>Access control and authentication</li>
              <li>Secure data transmission (SSL/TLS)</li>
              <li>Regular backup procedures</li>
            </ul>

            <h3 className="font-medium text-xl">2. Data Retention</h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>Active account data retained until account deletion</li>
              <li>Unverified accounts deleted after 1 day</li>
              <li>Inactive accounts archived after 12 months</li>
              <li>Backup retention for 1 day</li>
              <li>Legal compliance data retained as required</li>
            </ul>

            <h3 className="font-medium text-xl">3. Third-Party Services</h3>
            <p>We use trusted third-party services for:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Cloud storage (AWS, Google Cloud)</li>
              <li>Analytics (Google Analytics)</li>
              <li>Authentication (OAuth providers)</li>
              <li>Content delivery (CDN services)</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <PrivacyIcon icon={Shield} title="Your Rights and Controls" />
          <div className="mt-4 space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request data deletion</li>
              <li>Export your data</li>
              <li>Opt-out of data collection</li>
            </ul>

            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm">
                To exercise these rights, please contact our privacy team at{" "}
                <Link
                  href="mailto:dev.hashcodes@gmail.com"
                  className="text-primary hover:underline"
                >
                  dev.hashcodes@gmail.com
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 font-semibold text-2xl">Cookie Policy</h2>
          <div className="space-y-4">
            <p>We use cookies and similar technologies for:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Essential platform functionality</li>
              <li>Authentication state management</li>
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 font-semibold text-2xl">Children's Privacy</h2>
          <div className="space-y-4">
            <p>
              Our platform is not intended for children under 13. We do not
              knowingly collect information from children under 13. If you
              believe we have collected information from a child under 13,
              please contact us immediately.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 font-semibold text-2xl">
            International Data Transfers
          </h2>
          <div className="space-y-4">
            <p>
              Your information may be transferred to and processed in countries
              other than your own. As we use cloud services, your data may be
              stored on servers located in different regions. By using our
              platform, you consent to these transfers. For more information
              visit each third-party service's privacy policy.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 font-semibold text-2xl">
            Changes to This Policy
          </h2>
          <div className="space-y-4">
            <p>
              We may update this Privacy Policy periodically. We will notify you
              of any material changes through:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Email notifications</li>
              <li>Platform announcements</li>
              <li>Website notices</li>
            </ul>
          </div>
        </section>

        <FossBanner />

        <section className="mt-8">
          <h2 className="mb-4 font-semibold text-2xl">Contact Us</h2>
          <div className="space-y-4">
            <p>
              If you have questions about this Privacy Policy, please contact us
              at:
            </p>
            <div className="rounded-lg bg-muted p-4">
              <p>Zephyr FOSS</p>
              <p>
                Email:{" "}
                <Link
                  href="mailto:dev.hashcodes@gmail.com"
                  className="text-primary hover:underline"
                >
                  dev.hashcodes@gmail.com
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-lg bg-muted p-4">
          <p className="text-muted-foreground text-sm">
            By using Zephyr, you acknowledge that you have read and understood
            this Privacy Policy and agree to our collection, use, and disclosure
            of your information as described.
          </p>
        </section>
      </div>
    </div>
  );
}
