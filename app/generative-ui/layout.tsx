import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./generative-ui.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-gui-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-gui-display",
});

export const metadata: Metadata = {
  title: "Generative UI Demo",
  description:
    "AI SDK generative UI demo: tool results rendered as React weather and stock cards.",
};

export default function GenerativeUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${manrope.variable} ${fraunces.variable}`}>{children}</div>
  );
}
