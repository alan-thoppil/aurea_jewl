import Script from "next/script";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AUREA × JewelPro | Luxury Jewellery Atelier & Enterprise ERP",
  description:
    "AUREA is a premium luxury jewellery storefront with WebRTC AR Try-on, combined with JewelPro — a full real-time POS, Inventory, CRM, Gold Schemes, GST compliance & double-entry Accounting ERP for Indian jewellery retailers.",
  keywords: [
    "luxury jewellery India",
    "BIS hallmark gold jewellery",
    "jewellery ERP software",
    "POS billing system jewellery",
    "gold scheme savings",
    "AR try on jewellery",
    "GST jewellery HSN 7113",
    "online jewellery store",
    "diamond jewellery India"
  ],
  authors: [{ name: "AUREA Ateliers" }],
  creator: "AUREA × JewelPro",
  metadataBase: new URL("https://aurea-jewelpro.vercel.app"),
  openGraph: {
    title: "AUREA × JewelPro — Luxury Jewellery & Enterprise ERP",
    description: "Premium luxury jewellery eCommerce with AR Try-on and real-time enterprise management.",
    type: "website",
    locale: "en_IN",
    siteName: "AUREA × JewelPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREA × JewelPro",
    description: "Luxury jewellery eCommerce & enterprise ERP platform.",
  },
};

export const viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <Script id="mediapipe-patch" strategy="beforeInteractive">
          {`
            // Intercept Emscripten's abortive arguments getter to prevent inspect-tool crashes
            const originalDefineProperty = Object.defineProperty;
            Object.defineProperty = function(obj, prop, descriptor) {
              if (prop === 'arguments' && descriptor && typeof descriptor.get === 'function') {
                const origGet = descriptor.get;
                descriptor.get = function() {
                  try {
                    return origGet.apply(this, arguments);
                  } catch (e) {
                    // Suppressed noisy logs during check
                    return [];
                  }
                };
              }
              return originalDefineProperty(obj, prop, descriptor);
            };

            // Global filter to permanently silence noisy deprecated WebGL shadow map logs from Three.js/R3F
            const originalConsoleWarn = console.warn;
            console.warn = function(...args) {
              if (args[0] && typeof args[0] === 'string' && (
                args[0].includes('PCFSoftShadowMap') || 
                args[0].includes('WebGLShadowMap') ||
                (args[0].includes('deprecated') && args[0].includes('THREE'))
              )) {
                return; // Suppress from console/terminal permanently
              }
              originalConsoleWarn.apply(console, args);
            };
          `}
        </Script>
        <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/holistic.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-[#F5F5F5] font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
