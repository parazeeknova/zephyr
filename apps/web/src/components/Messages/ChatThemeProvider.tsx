import type { PropsWithChildren } from 'react';
import 'stream-chat-react/dist/css/v2/index.css';
import './Theme.css';

export function ChatThemeProvider({ children }: PropsWithChildren) {
  return <div className="str-chat">{children}</div>;
}
