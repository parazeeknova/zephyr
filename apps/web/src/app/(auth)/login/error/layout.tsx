export default function ErrorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}

export const metadata = {
  title: "Authentication Error",
  description: "Authentication error occurred during login"
};
