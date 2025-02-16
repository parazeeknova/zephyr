import { FileText, Shield } from 'lucide-react';
import Link from 'next/link';

interface LegalLinksCardProps {
  className?: string;
}

export function LegalLinksCard({ className }: LegalLinksCardProps) {
  return (
    <div
      className={`rounded-lg border border-primary/10 bg-primary/5 p-4 ${className}`}
    >
      <h3 className="mb-4 font-semibold text-primary">Legal Information</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/toc"
          className="group flex items-center gap-3 rounded-lg border border-primary/5 bg-background/80 p-4 transition-all hover:bg-accent hover:shadow-sm"
        >
          <div className="rounded-full bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-medium transition-colors group-hover:text-primary">
              Terms of Service
            </h4>
            <p className="text-muted-foreground text-sm">
              Read our terms and conditions
            </p>
          </div>
        </Link>

        <Link
          href="/privacy"
          className="group flex items-center gap-3 rounded-lg border border-primary/5 bg-background/80 p-4 transition-all hover:bg-accent hover:shadow-sm"
        >
          <div className="rounded-full bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-medium transition-colors group-hover:text-primary">
              Privacy Policy
            </h4>
            <p className="text-muted-foreground text-sm">
              Learn how we handle your data
            </p>
          </div>
        </Link>
      </div>

      <p className="mt-4 text-muted-foreground text-xs">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
