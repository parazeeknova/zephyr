'use client';

import ScrollUpButton from '@/components/Layouts/ScrollUpButton';
import { FossBanner } from '@/components/misc/foss-banner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';

export default function PrivacyPolicyPage() {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
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

        <Link href="/toc">
          <Button
            variant="ghost"
            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            Terms of Service
            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-0">
        <div className="mb-8 flex items-center gap-3">
          <LockKeyhole className="h-8 w-8 text-primary" />
          <h1 className="font-bold text-3xl">Privacy Policy</h1>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Last updated: January 13, 2025
          </p>

          <section className="mt-8">
            <p className="text-lg text-muted-foreground">
              At Zephyr, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our platform. Our commitment to privacy
              forms the foundation of our relationship with users, and we strive
              to be transparent about our data practices.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              Information Collection
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">Personal Information</h3>
              <p>
                We collect certain personal information necessary for platform
                functionality and user experience enhancement. This includes
                basic identification details such as your name and username,
                which help create your unique identity within our platform. Your
                email address serves as a primary contact point and
                authentication method. We also maintain profile information that
                you choose to share, including profile pictures and optional
                biographical details. When you choose to connect social media
                accounts, we store these connections to enable integrated
                features and enhanced functionality.
              </p>

              <p>
                Authentication data from third-party services is securely
                processed and stored when you choose to use alternative login
                methods. This information is handled with strict security
                protocols and is used solely for authentication purposes. We
                maintain this data in encrypted form and regularly audit our
                authentication systems to ensure continued security.
              </p>

              <h3 className="font-medium text-xl">Content Information</h3>
              <p>
                As you interact with our platform, we collect and store content
                that you create and share. This includes posts, comments, and
                any media uploads you make to the platform. Your interactions
                with other users' content, such as reactions and responses, are
                also recorded to enable social features and maintain
                conversation threads. Messages and communications within the
                platform are stored securely to ensure reliable delivery and
                maintain conversation history.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">Information Usage</h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">Service Provision</h3>
              <p>
                Your information enables us to provide and maintain core
                platform functionality. We use this data to manage your account,
                authenticate your access, and deliver appropriate content to
                you. Account-related information helps us maintain platform
                security and ensure proper access control. Communication
                services rely on stored user data to facilitate interactions
                between users while maintaining privacy and security standards.
              </p>

              <h3 className="font-medium text-xl">Platform Enhancement</h3>
              <p>
                We analyze platform usage patterns and performance metrics to
                continuously improve our services. This analysis helps identify
                areas for optimization and guides feature development decisions.
                Technical issues and bugs are investigated using collected data,
                enabling us to maintain platform stability and reliability. User
                experience improvements are driven by careful analysis of
                interaction patterns and user feedback, always prioritizing
                privacy and data minimization principles.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              Data Storage and Protection
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">Security Infrastructure</h3>
              <p>
                We implement comprehensive security measures to protect your
                data throughout its lifecycle. Sensitive information is
                protected using end-to-end encryption, ensuring data remains
                secure during transmission and storage. Our security
                infrastructure undergoes regular audits by qualified security
                professionals to identify and address potential vulnerabilities.
                Access to user data is strictly controlled through sophisticated
                authentication and authorization systems.
              </p>

              <h3 className="font-medium text-xl">Data Retention Policies</h3>
              <p>
                Our data retention policies balance user needs with privacy
                considerations. Active account data remains available throughout
                the account's lifetime, enabling continuous service access.
                Unverified accounts are automatically removed after 24 hours to
                maintain platform security and data minimization. Accounts that
                remain inactive for 12 months are archived to protect user
                privacy while maintaining service integrity. We maintain backups
                for a limited 24-hour period to ensure data recovery
                capabilities while minimizing data retention periods.
              </p>

              <h3 className="font-medium text-xl">Third-Party Services</h3>
              <p>
                We carefully select and monitor third-party service providers
                who assist in platform operation. Cloud storage services,
                including AWS and Google Cloud, are used with strict security
                configurations and data protection agreements. Analytics
                services help us understand platform usage patterns while
                respecting user privacy preferences. Authentication providers
                and content delivery networks are chosen based on their security
                standards and privacy commitments.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              User Rights and Controls
            </h2>
            <div className="space-y-4">
              <p>
                We are committed to protecting user privacy rights and providing
                transparent control over personal data. Every user maintains the
                right to access their personal information stored on our
                platform. You can request corrections to any inaccurate data,
                and we will process such requests promptly. Data deletion
                requests are handled with priority, ensuring thorough removal of
                personal information while maintaining platform integrity. We
                provide data export capabilities, allowing you to obtain copies
                of your information in standard formats.
              </p>

              <p>
                Users can manage their privacy preferences through platform
                settings, including options to opt-out of certain data
                collection practices. These controls are designed to be
                intuitive and accessible, empowering users to make informed
                decisions about their privacy. To exercise any of these rights
                or discuss privacy concerns, our dedicated privacy team can be
                reached at{' '}
                <Link
                  href="mailto:zephyyrrnyx@gmail.com"
                  className="text-primary hover:underline"
                >
                  zephyyrrnyx@gmail.com
                </Link>
                .
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">Cookie Policy</h2>
            <div className="space-y-4">
              <p>
                Our platform utilizes cookies and similar technologies to
                enhance and maintain core functionality. These technologies play
                a crucial role in providing a secure and seamless user
                experience. Essential cookies enable fundamental platform
                operations, including maintaining your authentication state
                throughout your session. These cookies are necessary for proper
                platform functionality and cannot be disabled without affecting
                your ability to use core features.
              </p>

              <p>
                We implement strict controls over cookie usage, limiting their
                application to essential platform functions. Our cookie
                implementation follows privacy-by-design principles, collecting
                only necessary data and maintaining appropriate security
                measures. Cookie lifetimes are carefully managed, with session
                cookies being removed upon browser closure and persistent
                cookies maintained only as long as necessary for proper platform
                operation.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">Children's Privacy</h2>
            <div className="space-y-4">
              <p>
                We take the protection of children's privacy extremely seriously
                and have designed our platform specifically for users aged 13
                and above. We do not knowingly collect or maintain personal
                information from children under the age of 13. Our registration
                process includes age verification steps, and we implement
                additional safeguards to prevent the creation of accounts by
                underage users.
              </p>

              <p>
                If we become aware that we have inadvertently collected personal
                information from a child under 13, we take immediate steps to
                delete such information from our systems. We encourage parents
                and guardians to monitor their children's online activities and
                help enforce this policy by instructing their children never to
                provide personal information through our platform. If you
                believe we might have collected information from a child under
                13, please contact us immediately at our designated privacy
                email address, and we will promptly investigate and address the
                situation.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              International Data Transfers
            </h2>
            <div className="space-y-4">
              <p>
                As a global platform utilizing cloud-based infrastructure, your
                information may be transferred to and processed in various
                countries worldwide. These international transfers are necessary
                to provide our services efficiently and maintain high
                availability. We implement appropriate safeguards to protect
                your information during these transfers, including standard
                contractual clauses and data processing agreements with our
                service providers.
              </p>

              <p>
                When your data is processed in different regions, it remains
                protected by robust security measures and data protection
                standards. We carefully select cloud service providers who
                maintain high security standards and comply with international
                data protection regulations. Each third-party service provider
                is bound by strict data protection requirements, and we
                regularly audit their compliance with our privacy and security
                standards. For detailed information about specific data transfer
                mechanisms and safeguards, users are encouraged to review the
                privacy policies of our third-party service providers or contact
                our privacy team.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              Changes to This Policy
            </h2>
            <div className="space-y-4">
              <p>
                Our Privacy Policy evolves alongside our platform and services,
                reflecting changes in our practices, legal requirements, and
                user needs. When we make material changes to this policy, we
                implement a comprehensive notification process to ensure users
                are properly informed. This includes direct email notifications
                to all registered users, prominent announcements within the
                platform interface, and updates to our website's privacy policy
                page.
              </p>

              <p>
                We encourage users to review policy updates carefully to
                understand how they may affect their privacy rights and data
                protection. Each update includes a summary of significant
                changes and their potential impact on users. Policy changes
                become effective upon publication, unless otherwise specified.
                Users who continue to use our platform after policy updates are
                considered to have accepted the revised terms. However, we
                ensure that any significant changes affecting user rights or
                data processing practices provide adequate notice and, where
                appropriate, obtain renewed consent.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">Contact Information</h2>
            <div className="space-y-4">
              <p>
                We maintain open channels of communication for all
                privacy-related inquiries and concerns. Our dedicated privacy
                team is committed to addressing your questions and ensuring your
                privacy rights are protected. Whether you need assistance
                understanding our privacy practices, exercising your data
                rights, or reporting potential privacy issues, we are here to
                help.
              </p>

              <div className="rounded-lg bg-muted p-4">
                <p>Zephyr FOSS</p>
                <p>
                  Email:{' '}
                  <Link
                    href="mailto:zephyyrrnyx@gmail.com"
                    className="text-primary hover:underline"
                  >
                    zephyyrrnyx@gmail.com
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <FossBanner />

          <section className="mt-8 rounded-lg bg-muted p-4">
            <p className="text-muted-foreground text-sm">
              By using Zephyr, you acknowledge that you have read and understood
              this Privacy Policy in its entirety. Your continued use of our
              platform indicates your agreement with our data collection,
              processing, and protection practices as described in this policy.
              We remain committed to protecting your privacy and maintaining the
              trust you place in us by choosing Zephyr as your platform
              provider.
            </p>
          </section>
        </div>
      </div>
      <ScrollUpButton isVisible={isVisible} />
    </div>
  );
}
