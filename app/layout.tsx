import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css"; // <--- ESSA LINHA É A MAIS IMPORTANTE!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buttons Express | Personalizados e Geeks",
  description: "A melhor loja de buttons personalizados e caixinhas surpresa. Encomende via WhatsApp!",
  icons: {
    icon: "/logo.png", // Isso faz sua logo virar o ícone da aba!
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>{children}</body>
    </html>
  );
}