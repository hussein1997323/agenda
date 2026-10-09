import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BRMOTORS | Agendamento",
  description: "Agende sua retirada com a segurança e a confiança da BRMOTORS.",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
