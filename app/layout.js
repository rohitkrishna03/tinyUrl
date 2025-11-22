// app/layout.js
import './globals.css';

export const metadata = {
  title: 'TinyUrl Dashboard',
  description: 'URL shortener dashboard built with Next.js and Tailwind CSS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
