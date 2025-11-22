// app/layout.js
import "../lib/patch-fetch";        // ✅ enable server fetch logging
import "./globals.css";            // ✅ keep your global styles (adjust if different)

export const metadata = {
  title: "TinyUrl Dashboard",
  description: "Admin dashboard for TinyUrl links",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
