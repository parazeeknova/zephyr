"use client";

import ScrollUpButton from "@/components/Layouts/ScrollUpButton";
import { Button } from "@/components/ui/button";
import { FossBanner } from "@zephyr-ui/misc/foss-banner";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

export default function TermsPage() {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen w-full px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="group-hover:-translate-x-1 h-4 w-4 transition-transform" />
            Drift
          </Button>
        </Link>

        <Link href="/privacy">
          <Button
            variant="ghost"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            Privacy Policy
            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-0">
        <div className="mb-8 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-bold text-3xl">Terms and Conditions</h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Last updated: 1st November 2024
          </p>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using Zephyr ("the Platform"), you agree to be
              bound by these Terms and Conditions. If you disagree with any part
              of these terms, you may not access the Platform.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">2. User Accounts</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You must be at least 13 years old to use this Platform.</li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You must provide accurate and complete information during
                registration.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              3. Data Collection and Usage
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">3.1 Data We Collect</h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>Profile information (name, username, email, avatar)</li>
                <li>Content you post (text, images, videos)</li>
                <li>Usage data (interactions, preferences, activity logs)</li>
              </ul>

              <h3 className="font-medium text-xl">3.2 How We Use Your Data</h3>
              <ul className="list-disc space-y-2 pl-6">
                <li>To provide and maintain the Platform</li>
                <li>To personalize your experience</li>
                <li>To improve our services</li>
                <li>To communicate with you</li>
                <li>To detect and prevent fraud</li>
              </ul>

              <h3 className="font-medium text-xl">3.3 Data Storage</h3>
              <p>
                Your data is stored securely using industry-standard encryption.
                We use various third-party providers including but not limited
                to:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Cloud storage services</li>
                <li>Content delivery networks</li>
                <li>Analytics providers</li>
                <li>Authentication services</li>
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">4. User Content</h2>
            <div className="space-y-4">
              <p>
                You retain your rights to any content you submit, post or
                display on the Platform.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  You grant us a worldwide, non-exclusive, royalty-free license
                  to use, copy, reproduce, process, adapt, modify, publish,
                  transmit, display and distribute your content.
                </li>
                <li>
                  You are responsible for your content and must have the right
                  to share any content you post.
                </li>
                <li>
                  We may remove any content that violates these terms or our
                  content policies.
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              5. Prohibited Activities
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Harassment or hate speech</li>
              <li>Spam or deceptive practices</li>
              <li>Malware or malicious code</li>
              <li>Copyright infringement</li>
              <li>Impersonation of others</li>
              <li>Exploitation of platform vulnerabilities</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              6. Privacy and Security
            </h2>
            <div className="space-y-4">
              <p>
                Our privacy practices are detailed in our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>We use industry-standard security measures</li>
                <li>We regularly audit our systems</li>
                <li>We encrypt data in transit and at rest</li>
                <li>We maintain incident response procedures</li>
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              7. Third-Party Services
            </h2>
            <p>
              We integrate with various third-party services. Your use of these
              services is subject to their respective terms and privacy
              policies.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                Authentication providers (Google, GitHub, Discord, Twitter)
              </li>
              <li>Cloud storage services(Uploadthing, Cloudflare R2)</li>
              <li>Caching services(Upstash Redis)</li>
              <li>Content delivery networks(Vercel, Github)</li>
              <li>Database providers(Vercel)</li>
              <li>Messaging services(Stream Chat)</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              8. Intellectual Property
            </h2>
            <div className="space-y-4">
              <p>
                The Platform and its original content (excluding user content)
                are and will remain the property of Zephyr and its licensors.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Our trademarks and trade dress may not be used without
                  permission
                </li>
                <li>
                  We respect intellectual property rights and expect users to do
                  the same
                </li>
                <li>We handle DMCA takedown requests promptly</li>
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the
              Platform:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>For violations of these terms</li>
              <li>At our sole discretion without notice</li>
              <li>Upon your request</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes via:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Email notification</li>
              <li>Platform announcement</li>
              <li>Update date on this page</li>
            </ul>
          </section>

          <FossBanner />

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              11. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <Link
                href="mailto:dev.hashcodes@gmail.com"
                className="text-primary hover:underline"
              >
                dev.hashcodes@gmail.com
              </Link>
            </p>
          </section>

          <section className="mt-8 rounded-lg bg-muted p-4">
            <p className="text-muted-foreground text-sm">
              By using Zephyr, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
      <ScrollUpButton isVisible={isVisible} />
    </div>
  );
}
