import "@/app/ui/global.css";
import { inter, lusitana } from "./ui/font";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 여기! */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
