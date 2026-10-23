import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./streaming-data.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-gui-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-gui-display",
});

export const metadata: Metadata = {
  title: "Streaming Data Demo",
  description:
    "AI SDK UI streaming data demo: data parts, sources, and transient notifications.",
};

export default function StreamingDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${manrope.variable} ${fraunces.variable}`}>{children}</div>
  );
}
