import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MuiAppThemeProvider } from '../lib/theme/MuiTheme';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Redmusical",
  description: "Plataforma para músicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MuiAppThemeProvider>
          {children}
        </MuiAppThemeProvider>
      </body>
    </html>
  );
}
