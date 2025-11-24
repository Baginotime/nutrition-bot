import "./globals.css";

export const metadata = {
  title: "Nutrition WebApp",
  description: "Calculate daily calories and macros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
        {children}
      </body>
    </html>
  );
}
