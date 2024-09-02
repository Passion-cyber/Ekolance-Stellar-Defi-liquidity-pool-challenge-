import "./globals.css";
import { Roboto } from "next/font/google";
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Eko Lance Stellar Developer Challenge",
  description: "Building a Simple DeFi Liquidity Pool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <section className="flex items-center flex-col justify-center h-full min-h-[100vh] over-flow-y-auto w-full">
          {children}
        </section>
      </body>
    </html>
  );
}
