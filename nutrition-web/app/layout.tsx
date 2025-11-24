import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Анкета питания",
  description: "Заполните анкету для расчета вашей нормы калорий",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #eff6ff, #eef2ff, #faf5ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          margin: 0,
        }}
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
