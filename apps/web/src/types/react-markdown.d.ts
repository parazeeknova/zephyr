declare module "react-markdown" {
  import type { ReactNode } from "react";

  interface ReactMarkdownOptions {
    children: string;
    components?: Record<string, any>;
  }

  export default function ReactMarkdown(props: ReactMarkdownOptions): ReactNode;
}
