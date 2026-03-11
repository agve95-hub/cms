import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.SITE_NAME || "CMS",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="text-xl font-bold text-gray-900">{process.env.SITE_NAME || "My Site"}</a>
        </div>
      </header>
      {children}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {process.env.SITE_NAME || "My Site"}
        </div>
      </footer>
    </div>
  );
}
