'use client';

import ScrollUpButton from '@/components/Layouts/ScrollUpButton';
import { FossBanner } from '@/components/misc/foss-banner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';

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
            Last updated: January 13, 2024
          </p>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              1. Agreement to Terms
            </h2>
            <div className="space-y-4">
              <p>
                By accessing or using Zephyr ("the Platform"), you acknowledge
                and agree to be bound by these Terms and Conditions ("Terms").
                These Terms constitute a legally binding agreement between you
                ("User", "you", or "your") and Zephyr ("we", "us", or "our")
                governing your access to and use of our services, including any
                associated applications, features, content, and functionality.
              </p>

              <p>
                Your access to and use of the Platform is conditioned upon your
                acceptance of and compliance with these Terms. These Terms apply
                to all visitors, users, and others who wish to access or use the
                Platform. If you disagree with any part of these Terms, you must
                immediately discontinue your access to and use of our services.
              </p>

              <p>
                We reserve the right to modify, amend, or update these Terms at
                any time and for any reason, with or without prior notice. Your
                continued use of the Platform following any modifications to
                these Terms constitutes your acceptance of such changes. It is
                your responsibility to review these Terms periodically for any
                updates or changes.
              </p>

              <p>
                These Terms should be read in conjunction with our Privacy
                Policy, Cookie Policy, and any other guidelines or policies
                referenced herein or posted on the Platform. By using our
                services, you also agree to these additional policies and
                guidelines.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">2. User Accounts</h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">
                2.1 Account Creation and Eligibility
              </h3>
              <p>
                To access certain features of the Platform, you must create an
                account. By creating an account, you warrant that you are at
                least 13 years of age and possess the legal authority to enter
                into these Terms. If you are creating an account on behalf of an
                organization, you warrant that you have the authority to bind
                that organization to these Terms.
              </p>

              <p>
                During the registration process, you must provide accurate,
                complete, and current information. This includes, but is not
                limited to, a valid email address, appropriate username, and any
                other information requested during the signup process. You are
                responsible for maintaining the accuracy and completeness of
                this information and must update it promptly if any changes
                occur.
              </p>

              <h3 className="font-medium text-xl">2.2 Account Security</h3>
              <p>
                You are solely responsible for maintaining the confidentiality
                and security of your account credentials, including your
                password. We recommend using strong, unique passwords and
                enabling any additional security features we may offer, such as
                two-factor authentication. You must notify us immediately upon
                becoming aware of any breach of security or unauthorized use of
                your account.
              </p>

              <p>
                You acknowledge that all activities that occur under your
                account are your responsibility. This includes any content
                posted, messages sent, or actions taken while logged into your
                account. We reserve the right to terminate accounts that have
                been inactive for an extended period or that we suspect have
                been compromised.
              </p>

              <h3 className="font-medium text-xl">2.3 Account Restrictions</h3>
              <p>
                We maintain the right to suspend, terminate, or restrict access
                to any account at our sole discretion, with or without notice,
                particularly in cases where we suspect violations of these
                Terms, fraudulent activity, or potential security risks. We may
                also reject account registrations or terminate accounts to
                comply with legal obligations or protect our users, systems, or
                reputation.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              3. Data Collection, Processing, and Storage
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">
                3.1 Data Collection and Processing
              </h3>
              <p>
                Our Platform collects and processes various types of data to
                provide, maintain, and improve our services. This data
                collection is fundamental to ensuring a secure, efficient, and
                personalized user experience. We adhere to strict data
                minimization principles, collecting only information that serves
                specific, documented purposes. The scope of our data collection
                encompasses authentication data, including email addresses and
                securely hashed passwords, as well as profile information that
                users choose to share on the Platform.
              </p>

              <p>
                User-generated content forms a significant portion of our data
                processing activities, including posts, comments, and media
                uploads that users create and share through our services. We
                also process technical data necessary for service delivery, such
                as IP addresses, device information, and browser types. This
                technical information helps us maintain platform security,
                optimize performance, and provide compatibility across different
                devices and browsers. Additionally, we analyze usage patterns
                and interaction data to improve our services and enhance user
                experience.
              </p>

              <h3 className="font-medium text-xl">
                3.2 Infrastructure and Storage
              </h3>
              <p>
                Our data storage infrastructure is built on enterprise-grade
                technology, utilizing self-hosted solutions that prioritize
                security, reliability, and performance. We maintain complete
                control over our data processing environment through a
                sophisticated stack of self-hosted services. Our primary
                database system provides robust storage for structured data,
                while our distributed object storage system ensures reliable
                handling of media files and user uploads. This infrastructure
                operates within secure, monitored environments that implement
                multiple layers of protection.
              </p>

              <p>
                To optimize performance and ensure efficient data access, we
                employ advanced caching mechanisms and load balancing systems.
                Our infrastructure is designed with redundancy and fault
                tolerance in mind, incorporating automated backup systems and
                disaster recovery procedures. Regular maintenance and monitoring
                ensure that our storage systems operate at peak efficiency while
                maintaining the highest standards of data protection and
                availability.
              </p>

              <h3 className="font-medium text-xl">3.3 Security Measures</h3>
              <p>
                We implement comprehensive security measures to protect data
                throughout its lifecycle within our systems. All data
                transmissions are secured using industry-standard encryption
                protocols, with TLS 1.3 ensuring secure data transfer between
                users and our servers. Data at rest is protected through robust
                encryption mechanisms, with encryption keys managed through
                secure, audited systems. Our security framework includes regular
                vulnerability assessments, penetration testing, and security
                audits to identify and address potential risks.
              </p>

              <p>
                Access to data is strictly controlled through sophisticated
                authentication and authorization systems. We maintain detailed
                access logs and conduct regular reviews of access patterns to
                detect and prevent unauthorized data access. Our security
                infrastructure includes advanced intrusion detection systems,
                firewalls, and real-time monitoring tools that help us identify
                and respond to potential security threats promptly.
              </p>

              <h3 className="font-medium text-xl">
                3.4 Data Retention and Deletion
              </h3>
              <p>
                Our data retention policies balance user needs, legal
                requirements, and privacy considerations. Active account data is
                maintained throughout the account's lifetime, ensuring
                continuous service availability while respecting user privacy
                rights. When accounts are deleted, we initiate a comprehensive
                data removal process that ensures thorough deletion of user
                information within 30 days, subject to legal retention
                requirements and legitimate business purposes.
              </p>

              <p>
                Backup systems maintain encrypted copies of data for a maximum
                of 90 days to ensure data recovery capabilities in case of
                technical issues or security incidents. System logs and usage
                data undergo anonymization after 12 months, preserving valuable
                operational insights while protecting user privacy. Our
                retention periods are regularly reviewed and updated to reflect
                changing legal requirements and evolving privacy standards.
              </p>

              <h3 className="font-medium text-xl">
                3.5 Data Protection Compliance
              </h3>
              <p>
                Our data handling practices comply with major data protection
                regulations, including GDPR and similar frameworks. We maintain
                detailed records of processing activities, conduct regular
                impact assessments, and implement privacy-by-design principles
                in our data processing operations. Our self-hosted
                infrastructure enables us to maintain strict control over data
                processing activities, ensuring compliance with data
                localization requirements and cross-border transfer regulations.
              </p>

              <p>
                We recognize our obligations as both data controller and
                processor, implementing appropriate technical and organizational
                measures to ensure data protection. Our commitment to data
                protection extends to maintaining transparent communication
                about our data practices and providing users with control over
                their personal information through comprehensive privacy
                settings and data management tools.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">4. User Content</h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">
                4.1 Content Ownership and Licenses
              </h3>
              <p>
                When you create and share content on our Platform, you retain
                full ownership rights to your original content. However, by
                posting content on our Platform, you grant us a worldwide,
                non-exclusive, royalty-free, sublicensable, and transferable
                license to use, reproduce, distribute, prepare derivative works
                of, display, and perform your content. This license is essential
                for our Platform's operation, enabling us to display your
                content to other users, process and store it on our servers,
                create necessary backups, and optimize content delivery across
                different devices and services.
              </p>

              <p>
                The scope of this license is carefully balanced to protect your
                rights while enabling platform functionality. It allows us to
                analyze content for platform improvements and security purposes,
                modify formats for different display requirements, and ensure
                content availability across our service infrastructure. This
                license remains in effect for as long as your content exists on
                our Platform and terminates when you remove the content or
                delete your account, subject to reasonable retention periods for
                technical and legal requirements.
              </p>

              <h3 className="font-medium text-xl">
                4.2 Content Responsibilities
              </h3>
              <p>
                When you post content on our Platform, you assume important
                responsibilities regarding its legitimacy and appropriateness.
                You represent and warrant that you either own or have obtained
                all necessary rights, licenses, consents, and permissions needed
                to share the content. This includes ensuring that your content
                does not infringe upon any third-party intellectual property
                rights, privacy rights, publicity rights, or other legal rights.
                Furthermore, you confirm that you have obtained appropriate
                consent from any individuals featured or referenced in your
                content.
              </p>

              <p>
                Your content must comply with all applicable laws, regulations,
                and our community guidelines. This includes respecting copyright
                laws, data protection regulations, and content appropriateness
                standards. We expect users to exercise good judgment and
                maintain professional standards when sharing content,
                considering the diverse nature of our platform community and the
                importance of maintaining a respectful environment for all
                users.
              </p>

              <h3 className="font-medium text-xl">
                4.3 Content Review and Moderation
              </h3>
              <p>
                While we do not actively monitor all user content, we reserve
                the right to review, screen, and monitor content posted to the
                Platform. This oversight helps us maintain platform quality,
                ensure compliance with our terms and guidelines, and protect our
                user community. We may, at our discretion, remove or modify
                content that violates our terms, community guidelines, or
                applicable laws. Our moderation decisions are made thoughtfully,
                considering context, intent, and potential impact on the
                platform community.
              </p>

              <h3 className="font-medium text-xl">
                4.4 Content Preservation and Removal
              </h3>
              <p>
                We maintain specific protocols for content preservation and
                removal that balance user rights with platform obligations. When
                content is flagged for review, we follow established procedures
                to evaluate the content fairly and make appropriate
                determinations. In cases where content removal is necessary, we
                strive to provide clear explanations to affected users and,
                where appropriate, opportunities to appeal our decisions. We may
                preserve certain content for legal compliance purposes, such as
                responding to legal orders or investigating platform violations.
              </p>

              <p>
                Additionally, we may need to preserve or disclose content to
                comply with legal obligations, enforce our Terms and policies,
                protect user rights and safety, or address technical issues.
                Such actions are taken with careful consideration for user
                privacy and platform integrity. We maintain detailed records of
                content removals and preservations to ensure transparency and
                accountability in our content management practices.
              </p>

              <h3 className="font-medium text-xl">
                4.5 Content Distribution and Visibility
              </h3>
              <p>
                The Platform employs sophisticated systems to manage content
                distribution and visibility. These systems consider factors such
                as content type, user preferences, and platform guidelines to
                ensure appropriate content delivery. We may adjust content
                visibility or distribution parameters to maintain platform
                quality, enhance user experience, or address technical
                requirements. Users retain control over their content's basic
                visibility settings, though platform-wide distribution
                mechanisms may affect how and where content appears within our
                services.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              5. Prohibited Activities
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">
                5.1 Platform Security and Integrity
              </h3>
              <p>
                To maintain the integrity and security of our platform, we
                strictly prohibit any activities that could compromise our
                systems or user safety. This includes any attempts to breach
                security measures, probe for vulnerabilities, or interfere with
                our platform's operation. Users must not engage in activities
                designed to overwhelm our systems, such as distributed
                denial-of-service attacks, or attempt to gain unauthorized
                access to platform resources. The use of automated tools,
                including bots, scrapers, or other automated access methods, is
                prohibited without our explicit written permission.
              </p>

              <p>
                Furthermore, any actions that could degrade platform performance
                or disrupt service availability for other users are strictly
                forbidden. This encompasses attempts to circumvent platform
                limitations, exploit system vulnerabilities, or interfere with
                our monitoring and security systems. We maintain sophisticated
                detection systems to identify and prevent such activities, and
                violations may result in immediate account termination and
                potential legal action.
              </p>

              <h3 className="font-medium text-xl">
                5.2 Content and Behavior Standards
              </h3>
              <p>
                Our platform maintains high standards for user conduct and
                content appropriateness. Users must not create, transmit, or
                store any content that promotes violence, discrimination, or
                illegal activities. This includes content that could be
                considered harassing, abusive, or threatening to other users. We
                take a particularly strict stance against content that exploits
                minors, promotes terrorism, or facilitates criminal activities.
                The distribution of malicious software, including viruses,
                malware, or other harmful code, is expressly prohibited.
              </p>

              <p>
                Users must respect intellectual property rights and privacy
                considerations in all their platform activities. The
                unauthorized sharing of copyrighted material, trade secrets, or
                confidential information is prohibited. Similarly, users must
                not share personal or private information about others without
                explicit consent. Our content monitoring systems and community
                reporting mechanisms help us identify and address violations of
                these standards promptly.
              </p>

              <h3 className="font-medium text-xl">5.3 Account Integrity</h3>
              <p>
                Maintaining account integrity is crucial for platform security
                and user trust. Users are prohibited from creating multiple
                accounts for deceptive purposes or sharing account credentials
                with unauthorized parties. Any attempt to impersonate other
                users, platform staff, or official entities is strictly
                forbidden. We actively monitor for signs of account abuse,
                including suspicious login patterns or unauthorized access
                attempts. Users must promptly report any suspected unauthorized
                access to their accounts through our designated security
                channels.
              </p>

              <h3 className="font-medium text-xl">5.4 Commercial Activities</h3>
              <p>
                Our platform maintains specific guidelines regarding commercial
                activities to protect user experience and prevent abuse.
                Unauthorized advertising, promotional campaigns, or commercial
                solicitation is prohibited without explicit permission. Users
                must not attempt to sell or transfer their account access to
                others, as this compromises platform security and user trust.
                The collection of user information for commercial purposes
                without appropriate authorization and consent is strictly
                forbidden. We actively monitor for and remove content that
                violates these commercial activity restrictions.
              </p>

              <h3 className="font-medium text-xl">
                5.5 Network and Resource Usage
              </h3>
              <p>
                To ensure fair and efficient platform operation, we prohibit
                excessive or abusive use of platform resources. Users must not
                engage in activities that could overburden our systems or
                degrade service quality for others. This includes generating
                excessive network traffic, initiating large numbers of automated
                requests, or attempting to circumvent platform rate limits. We
                implement sophisticated monitoring systems to detect and prevent
                such abuse, ensuring optimal performance for all users.
              </p>

              <p>
                Additionally, users must respect the technical boundaries and
                limitations we establish for platform stability. Any attempt to
                bypass these restrictions or exploit platform features in
                unintended ways is prohibited. We regularly review and adjust
                our resource allocation policies to maintain optimal platform
                performance while preventing abuse. Violations of these usage
                policies may result in temporary or permanent restrictions on
                account functionality.
              </p>

              <h3 className="font-medium text-xl">
                5.6 Enforcement and Consequences
              </h3>
              <p>
                We maintain a robust system for monitoring and enforcing these
                prohibitions. Violations may result in a range of consequences,
                from temporary feature restrictions to permanent account
                termination, depending on the severity and frequency of the
                violation. We investigate reported violations thoroughly and
                maintain detailed records of enforcement actions. Users found to
                be repeatedly or deliberately violating these terms may face
                additional consequences, including legal action where
                appropriate. Our enforcement decisions are made carefully,
                considering the context and impact of violations while
                maintaining consistency in our application of these policies.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              6. Privacy and Security
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">6.1 Privacy Commitment</h3>
              <p>
                Our commitment to privacy forms the cornerstone of our platform
                operations. We maintain comprehensive privacy practices that are
                detailed in our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which forms an integral part of these Terms. This policy
                outlines our approach to data collection, processing, storage,
                and protection, reflecting our dedication to safeguarding user
                privacy while delivering exceptional service quality. We
                regularly review and update our privacy practices to align with
                evolving industry standards and regulatory requirements.
              </p>

              <h3 className="font-medium text-xl">
                6.2 Security Infrastructure
              </h3>
              <p>
                Our security framework implements multiple layers of protection,
                beginning with our foundational infrastructure. We employ
                enterprise-grade access control systems that include
                multi-factor authentication, role-based access control, and
                sophisticated session management protocols. These systems work
                in concert to ensure that user data remains protected while
                maintaining seamless platform functionality. Our infrastructure
                is regularly audited and updated to address emerging security
                challenges and maintain robust protection against potential
                threats.
              </p>

              <p>
                Data protection remains at the forefront of our security
                measures, with end-to-end encryption implemented for data in
                transit and at rest. We utilize industry-standard encryption
                protocols and maintain secure key management systems to ensure
                data confidentiality. Our network security infrastructure
                includes advanced firewalls, intrusion detection systems, and
                comprehensive DDoS protection mechanisms, all working together
                to maintain platform integrity and data security.
              </p>

              <h3 className="font-medium text-xl">6.3 Continuous Monitoring</h3>
              <p>
                Our security operations center maintains 24/7 monitoring of all
                platform components, employing advanced threat detection systems
                and automated alerting mechanisms. This continuous surveillance
                allows us to identify and respond to potential security
                incidents promptly. We utilize sophisticated monitoring tools
                that provide real-time visibility into our infrastructure,
                enabling rapid detection and mitigation of security threats. Our
                incident response team remains on standby to address any
                security concerns that may arise, ensuring minimal impact to
                platform operations and user data.
              </p>

              <h3 className="font-medium text-xl">6.4 Security Practices</h3>
              <p>
                We maintain rigorous security practices throughout our
                organization, including regular security assessments and
                penetration testing conducted by qualified security
                professionals. Our team undergoes continuous security training
                to stay current with evolving threats and protection measures.
                We regularly review and update our security policies and
                procedures to reflect new threats and industry best practices,
                ensuring our security posture remains robust and effective.
              </p>

              <h3 className="font-medium text-xl">
                6.5 User Security Responsibilities
              </h3>
              <p>
                While we implement comprehensive security measures at the
                platform level, security remains a shared responsibility. We
                strongly encourage users to adopt security best practices in
                their platform interactions. This includes using strong, unique
                passwords for their accounts, enabling two-factor authentication
                when available, and maintaining the confidentiality of their
                account credentials. Users should promptly report any suspected
                security incidents or unauthorized access attempts through our
                designated security channels.
              </p>

              <p>
                Our commitment to security extends beyond technical measures to
                encompass user education and awareness. We regularly provide
                security advisories and best practice recommendations to help
                users protect their accounts and data. Through this
                collaborative approach to security, we work to maintain a secure
                environment that protects both individual users and the broader
                platform community. Users are encouraged to review our security
                documentation and stay informed about our evolving security
                practices and recommendations.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              7. Infrastructure and Services
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">7.1 Core Infrastructure</h3>
              <p>
                Our platform operates on enterprise-grade infrastructure
                designed to deliver exceptional performance, reliability, and
                security. We maintain complete control over our technology stack
                through self-hosted solutions deployed in secure,
                enterprise-class data centers. These facilities provide
                redundant power systems, advanced cooling infrastructure, and
                multiple network connectivity options to ensure continuous
                service availability. Our infrastructure architecture implements
                multiple layers of redundancy and failover capabilities to
                maintain service stability even during unexpected events.
              </p>

              <p>
                The compute resources powering our platform utilize
                high-performance servers with sophisticated auto-scaling
                capabilities. This dynamic infrastructure adjusts automatically
                to accommodate varying workloads, ensuring consistent
                performance during peak usage periods while optimizing resource
                utilization during quieter times. Our deployment architecture
                spans multiple availability zones, providing geographical
                redundancy and improved service resilience.
              </p>

              <h3 className="font-medium text-xl">
                7.2 Storage and Data Management
              </h3>
              <p>
                Our data management infrastructure combines multiple specialized
                systems to provide comprehensive storage solutions. The primary
                database layer utilizes enterprise-grade database systems with
                real-time replication and automated backup mechanisms. This
                ensures data durability while maintaining rapid access to
                information. For media and file storage, we employ distributed
                object storage systems that provide high availability and
                exceptional data durability. These systems maintain multiple
                copies of data across different storage nodes, protecting
                against hardware failures and ensuring continuous data
                accessibility.
              </p>

              <p>
                To optimize performance and reduce latency, we implement
                sophisticated caching mechanisms throughout our infrastructure.
                This multi-tiered caching strategy includes in-memory caching
                for frequently accessed data, content delivery optimization for
                static assets, and intelligent data prefetching mechanisms. Our
                storage systems are regularly monitored and automatically scaled
                to accommodate growing data volumes while maintaining consistent
                performance.
              </p>

              <h3 className="font-medium text-xl">7.3 Network Architecture</h3>
              <p>
                Our network infrastructure implements advanced routing and load
                balancing mechanisms to ensure optimal traffic distribution and
                service reliability. Multiple layers of security controls,
                including enterprise-grade firewalls, intrusion detection
                systems, and DDoS protection services, safeguard our network
                perimeter. We maintain redundant network paths and multiple
                upstream providers to ensure consistent connectivity and protect
                against network-level failures.
              </p>

              <p>
                The platform's internal network architecture follows zero-trust
                security principles, with strict segmentation between different
                service components. All internal communication is encrypted and
                authenticated, with comprehensive access controls and monitoring
                at each network boundary. This sophisticated network design
                enables us to maintain high security standards while delivering
                excellent performance.
              </p>

              <h3 className="font-medium text-xl">
                7.4 Monitoring and Operations
              </h3>
              <p>
                Our operations team maintains comprehensive monitoring systems
                that provide real-time visibility into all aspects of platform
                performance. Sophisticated alerting mechanisms automatically
                notify relevant personnel of any anomalies or potential issues,
                enabling rapid response to emerging situations. We collect and
                analyze detailed metrics across our infrastructure, using this
                data to optimize performance and plan capacity expansions
                proactively.
              </p>

              <p>
                Regular maintenance procedures are carefully scheduled and
                executed to minimize service impact while ensuring system
                reliability. Our change management processes include thorough
                testing and validation procedures, with automated rollback
                capabilities to protect against unexpected issues. We maintain
                detailed documentation of all operational procedures and
                regularly review and update these processes to incorporate
                lessons learned and emerging best practices.
              </p>

              <h3 className="font-medium text-xl">
                7.5 Disaster Recovery and Business Continuity
              </h3>
              <p>
                Our platform incorporates comprehensive disaster recovery
                capabilities designed to protect against various failure
                scenarios. Regular backup procedures capture critical data and
                system configurations, with backups stored securely in
                geographically separate locations. We maintain detailed recovery
                procedures and regularly test our ability to restore services
                from backup data, ensuring our readiness to handle various
                disaster scenarios.
              </p>

              <p>
                Business continuity planning extends beyond technical systems to
                encompass operational procedures and personnel responsibilities.
                We maintain clear escalation paths and emergency response
                procedures, ensuring our team can respond effectively to any
                situation. Regular drills and scenario planning exercises help
                us refine these procedures and maintain operational readiness.
                Our commitment to service reliability drives continuous
                improvement in our recovery capabilities and business continuity
                practices.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              8. Intellectual Property
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">8.1 Platform Ownership</h3>
              <p>
                The Platform, including its original content, features, and
                functionality, is owned exclusively by us and is protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property or proprietary rights laws. This
                ownership extends to all aspects of our platform, including but
                not limited to our source code, software components, user
                interface designs, graphics, platform architecture, and all
                associated documentation and technical materials. Our brand
                assets, including marketing materials and visual elements, are
                similarly protected under applicable intellectual property laws.
              </p>

              <h3 className="font-medium text-xl">8.2 License Grants</h3>
              <p>
                Through these Terms, we grant you a limited, non-exclusive,
                non-transferable, and revocable license to access and use the
                Platform for its intended purposes. This license is carefully
                structured to protect our intellectual property while enabling
                legitimate platform use. Users must respect these license
                limitations, which prohibit any modification, derivative works,
                commercial exploitation, reverse engineering, or decompilation
                of our platform components. Furthermore, users may not remove or
                alter any proprietary notices, attempt unauthorized copying, or
                distribute platform materials without explicit permission.
              </p>

              <h3 className="font-medium text-xl">8.3 Trademark Protection</h3>
              <p>
                Our trademarks, service marks, logos, and brand elements
                represent valuable intellectual property assets that are
                fundamental to our identity and reputation. These assets are
                protected by law and require explicit written permission for any
                use. This protection encompasses our company name, logos,
                product and service names, marketing slogans, taglines, visual
                design elements, and our presence across digital platforms,
                including domain names and social media identities. Unauthorized
                use of these assets is strictly prohibited and may result in
                legal action.
              </p>

              <h3 className="font-medium text-xl">8.4 Copyright Protection</h3>
              <p>
                We maintain a strong commitment to respecting intellectual
                property rights, both our own and those of others. Our copyright
                protection framework includes comprehensive DMCA compliance
                measures and clear procedures for addressing copyright
                infringement claims. We employ sophisticated content monitoring
                systems to detect potential copyright violations and maintain
                educational resources to help users understand and comply with
                copyright laws. Our platform implements a strict repeat
                infringer policy to address systematic copyright violations
                effectively.
              </p>

              <h3 className="font-medium text-xl">8.5 Third-Party Rights</h3>
              <p>
                In our commitment to intellectual property rights, we
                acknowledge and respect the intellectual property of third
                parties integrated into or used in conjunction with our
                platform. This includes various components such as software
                libraries, dependencies, media content, documentation, APIs, and
                design elements. Users must ensure they possess the necessary
                rights or permissions when incorporating third-party content
                into their platform activities. We actively monitor and maintain
                appropriate licenses for all third-party components integrated
                into our platform, ensuring compliance with respective
                intellectual property rights and usage terms.
              </p>

              <p>
                The protection of intellectual property rights is fundamental to
                maintaining the integrity and value of our platform. We actively
                enforce these rights while respecting the intellectual property
                rights of others, creating a balanced ecosystem that promotes
                innovation while protecting creative and technical investments.
                Users are encouraged to report any suspected intellectual
                property violations through our designated channels, enabling us
                to address concerns promptly and maintain the highest standards
                of intellectual property protection.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">9. Termination</h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">9.1 Termination Grounds</h3>
              <p>
                We maintain the right to suspend or terminate your access to the
                Platform when necessary to protect our services, users, or
                comply with legal obligations. Such actions may be taken in
                response to violations of these Terms, extended periods of
                account inactivity, or when required by law. We particularly
                monitor for activities that compromise platform security,
                violate user privacy, or disrupt service operations.
              </p>

              <p>
                Account termination may occur with or without prior notice,
                depending on the severity and urgency of the situation. In cases
                of severe violations or security threats, immediate action may
                be taken to protect platform integrity. However, where possible,
                we strive to provide advance notice and clear explanations for
                our actions.
              </p>

              <h3 className="font-medium text-xl">9.2 Termination Process</h3>
              <p>
                When account termination becomes necessary, we follow a
                structured process designed to protect both user interests and
                platform security. This process typically begins with a
                notification to the affected user, explaining the reasons for
                termination and outlining any available remedial actions. We
                provide a reasonable timeframe for users to export their data
                and make necessary arrangements before final account closure.
              </p>

              <p>
                During the termination process, we maintain transparent
                communication and provide clear instructions regarding data
                access and export options. Users are given the opportunity to
                preserve their information within the constraints of our
                security policies and legal obligations. This may include
                downloading personal data, content, and relevant account
                information.
              </p>

              <h3 className="font-medium text-xl">
                9.3 Post-Termination Effects
              </h3>
              <p>
                Following account termination, all access rights and licenses
                granted under these Terms cease immediately. User content will
                be handled in accordance with our data retention policies, which
                are designed to balance user privacy, legal requirements, and
                platform security. Certain provisions of these Terms,
                particularly those relating to intellectual property rights,
                confidentiality, and liability limitations, survive termination
                and continue to bind both parties.
              </p>

              <p>
                We maintain secure archives of terminated account data for a
                limited period as required by law or necessary for legitimate
                business purposes. This data is protected by our standard
                security measures and is accessible only to authorized personnel
                for specific, documented purposes such as legal compliance or
                security investigations.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              10. Changes to Terms
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">10.1 Evolution of Terms</h3>
              <p>
                These Terms evolve alongside our platform, services, and legal
                obligations. We regularly review and update them to reflect
                changes in our operations, user needs, and regulatory
                requirements. This evolution ensures that our Terms remain
                relevant, comprehensive, and protective of both user and
                platform interests. Updates may address new features, security
                requirements, legal compliance, or improvements in our service
                delivery.
              </p>

              <p>
                Our commitment to transparency means that we carefully document
                and communicate all changes to these Terms. We maintain a
                detailed change history, allowing users to track modifications
                and understand how the Terms have evolved over time. This
                documentation includes the rationale for significant changes and
                their potential impact on user experience.
              </p>

              <h3 className="font-medium text-xl">
                10.2 Communication of Changes
              </h3>
              <p>
                When we make material changes to these Terms, we implement a
                comprehensive notification process to ensure users are properly
                informed. This includes direct email communications to
                registered users, prominent notices within the platform
                interface, and updates to our Terms page. For significant
                modifications that substantially affect user rights or
                obligations, we provide at least 30 days' advance notice before
                the changes take effect.
              </p>

              <p>
                During this notice period, users have the opportunity to review
                the proposed changes and understand their implications. We
                encourage users to reach out with questions or concerns about
                updates to the Terms. This dialogue helps us ensure that our
                Terms remain clear, fair, and aligned with user expectations
                while maintaining necessary protections for our platform.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              11. Contact Information
            </h2>
            <div className="space-y-4">
              <h3 className="font-medium text-xl">
                11.1 Official Communication Channels
              </h3>
              <p>
                For your security and to prevent fraud, we exclusively
                communicate through our official email domains: "@zephyyrr.in"
                (e.g., updates@zephyyrr.in) and our verified Gmail address
                (zephyyrrnyx@gmail.com). Any communication claiming to be from
                Zephyr that originates from other email addresses should be
                treated as potentially fraudulent. We strongly encourage users
                to verify email authenticity and report any suspicious
                communications to our security team. Never share sensitive
                information or account credentials in response to emails from
                unverified sources.
              </p>

              <h3 className="font-medium text-xl">
                11.2 Communication Channels
              </h3>
              <p>
                We maintain open channels of communication to address user
                inquiries, concerns, and feedback regarding our platform and
                services. Our primary points of contact is{' '}
                <Link
                  href="mailto:zephyyrrnyx@gmail.com"
                  className="text-primary hover:underline"
                >
                  zephyyrrnyx@gmail.com
                </Link>
                . This address is monitored regularly during business hours to
                ensure timely responses to user communications. For enhanced
                security, we implement email signing and verification protocols
                to authenticate our communications.
              </p>
              <p>
                Our support team (me) is dedicated to providing comprehensive
                assistance across various aspects of our service. Whether you
                have questions about these Terms, technical issues, or general
                platform inquiries, we strive to provide clear, helpful
                responses that address your specific needs. We maintain
                professional standards in all communications and handle each
                inquiry with appropriate attention and care.
              </p>

              <h3 className="font-medium text-xl">11.3 Response Commitment</h3>
              <p>
                We understand the importance of timely communication and
                maintain high standards for response times across all support
                channels. Our team processes inquiries during regular business
                hours, Monday through Friday, from 11 AM to 9 PM (IST). We
                prioritize urgent matters, particularly those relating to
                security concerns or service disruptions, ensuring that critical
                issues receive immediate attention.
              </p>

              <p>
                For optimal support, we recommend including relevant details in
                your initial communication, such as account information,
                specific concerns, and any pertinent context. This helps us
                provide more accurate and efficient responses. While we strive
                to address all inquiries promptly, complex issues may require
                additional time for thorough investigation and resolution.
              </p>

              <h3 className="font-medium text-xl">
                11.4 Email Security Advisory
              </h3>
              <p>
                To protect yourself from potential phishing attempts and
                fraudulent communications, always verify that emails from Zephyr
                originate from our official domains. Our legitimate email
                communications will only come from addresses ending in
                "@zephyyrr.in" or our verified address "zephyyrrnyx@gmail.com".
                We employ industry-standard email authentication protocols (SPF,
                DKIM, and DMARC) to prevent email spoofing. If you receive any
                suspicious communications claiming to be from Zephyr from other
                email addresses, please forward them to our security team (me)
                at zephyyrrnyx@gmail.com and do not click on any links or
                download any attachments from these suspicious sources.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-4 font-semibold text-2xl">
              12. Data Processing Agreement
            </h2>
            <div className="space-y-4">
              <p>
                For users subject to GDPR, CCPA, and similar data protection
                regulations, we act as both the data controller and data
                processor for information processed through our platform. This
                dual role reflects our commitment to maintaining direct
                responsibility for data handling and protection, rather than
                delegating these critical functions to third parties. Our
                self-hosted infrastructure enables us to maintain complete
                control over data processing activities and implement stringent
                security measures.
              </p>

              <p>
                In our capacity as data controller and processor, we maintain
                comprehensive records of all data processing activities. This
                includes detailed documentation of data flows, processing
                purposes, security measures, and data retention periods. We
                regularly update these records to reflect changes in our
                processing activities and to ensure continued compliance with
                evolving data protection requirements. Our approach to data
                processing emphasizes transparency, security, and user control
                over personal information.
              </p>

              <p>
                We implement appropriate technical and organizational measures
                to ensure data security, including encryption at rest and in
                transit, access controls, regular security audits, and employee
                training programs. Our data processing activities are designed
                to protect user privacy while maintaining the functionality and
                performance of our services. We regularly review and update
                these measures to address new security challenges and
                technological developments.
              </p>

              <p>
                In accordance with data protection regulations, we commit to
                promptly notifying relevant supervisory authorities and affected
                users in the event of a data breach. Our incident response
                procedures ensure that we can detect, report, and address
                security incidents within the mandatory 72-hour notification
                period. We maintain detailed breach response plans and regularly
                conduct drills to ensure our team can effectively respond to
                security incidents.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-lg bg-muted p-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using the Zephyr platform, you acknowledge that
                you have read, understood, and agreed to these Terms and
                Conditions in their entirety. These Terms represent the complete
                agreement between you and Zephyr regarding your use of our
                services and supersede any prior agreements or understandings,
                whether written or oral. We encourage you to regularly review
                these Terms as they may be updated from time to time to reflect
                changes in our services, legal requirements, or operational
                needs.
              </p>

              <p className="text-muted-foreground">
                Your continued use of our platform following any modifications
                to these Terms constitutes your acceptance of such changes. If
                you do not agree with any aspect of these Terms, you must
                immediately discontinue use of our services. We remain committed
                to maintaining the security, privacy, and integrity of our
                platform while providing you with innovative and reliable
                services. For any questions or concerns about these Terms,
                please contact us through our official communication channels as
                specified in Section 11.
              </p>

              <p className="text-muted-foreground">
                These Terms were last updated on March 19, 2024, and are
                effective immediately for all users of the Zephyr platform. We
                maintain archived versions of previous Terms for reference
                purposes, which can be requested through our official support
                channels. Thank you for choosing Zephyr as your trusted
                platform.
              </p>

              <p className="mt-4 border-border border-t pt-4 text-muted-foreground italic">
                In the spirit of transparency, we should mention that these
                Terms were crafted with the assistance of Mr. Chad Gee Pey T
                while Zephyr was in development. While we've done our best to
                make them comprehensive and accurate, we're committed to
                evolving these Terms as our platform grows. Think of this as our
                "beta version" of legalese - we promise to keep improving it,
                just like our code! Rest assured, though: our commitment to your
                privacy, security, and satisfaction is very much human and very
                much real. As we continue to develop and refine our platform,
                we'll update these Terms to be even more specific to our
                services. Until then, keep building awesome things with us! 🚀
              </p>
            </div>
          </section>
        </div>

        <FossBanner />
      </div>
      <ScrollUpButton isVisible={isVisible} />
    </div>
  );
}
