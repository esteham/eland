import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import LogoFooter from "../../../public/images/LogoFooter.png";

// Optional: place SVG/PNG logos at public/images/payments/* and update below
const PAYMENT_LOGOS = [
  { src: "/images/payments/visa.svg", alt: "Visa" },
  { src: "/images/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/images/payments/amex.svg", alt: "American Express" },
  { src: "/images/payments/bkash.svg", alt: "bKash" },
  { src: "/images/payments/nagad.svg", alt: "Nagad" },
  { src: "/images/payments/rocket.svg", alt: "Rocket" },
  { src: "/images/payments/upay.svg", alt: "Upay" },
  { src: "/images/payments/citytouch.svg", alt: "Citytouch" },
  { src: "/images/payments/dbbl.svg", alt: "DBBL Nexus" },
];

function PaymentLogo({ src, alt }) {
  const [err, setErr] = React.useState(false);
  if (err || !src) {
    return (
      <div className="h-8 px-3 grid place-items-center rounded bg-white/10 text-xs text-white/80 border border-white/15">
        {alt}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-8 w-auto object-contain drop-shadow"
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}

export default function Footer() {
  return (
    <footer className="relative z-20 text-white">
      {/* Top wave divider */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand + Tagline */}
            <div className="md:col-span-4">
              <Link to="/" className="flex items-center gap-3">
                <div
                  className="h-12 w-44 bg-center bg-contain bg-no-repeat"
                  style={{ backgroundImage: `url(${LogoFooter})` }}
                  aria-hidden
                />
              </Link>
              <p className="mt-4 text-sm text-gray-300/90 max-w-sm">
                E‑Land — Comprehensive Land Record & Tax Management Platform.
                Secure, scalable, and built for Bangladesh.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-300/90">
                <ShieldCheck className="h-4 w-4" /> ISO‑style security practices
                • Encrypted at rest & in transit
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold tracking-wide text-white">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-2 text-gray-300/90 text-sm">
                <li>
                  <Link className="hover:text-white" to="/land">
                    Explore Land
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/land-tax">
                    Land Tax
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/mutation">
                    Mutation
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/khatian">
                    Khatian Search
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/pricing">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold tracking-wide text-white">
                Resources
              </h4>
              <ul className="mt-4 space-y-2 text-gray-300/90 text-sm">
                <li>
                  <Link className="hover:text-white" to="/docs">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/guides">
                    User Guides
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/faq">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/support">
                    Support
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" to="/status">
                    System Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold tracking-wide text-white">
                Contact
              </h4>
              <ul className="mt-4 space-y-3 text-gray-300/90 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5" /> +880 1872‑988883
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5" /> hello@eland.example
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" /> Finlay Square (Level 4,
                  Shop 406), Nasirabad, Chattogram
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h5 className="text-sm font-semibold">We accept</h5>
                <p className="text-xs text-gray-300/90 mt-1">
                  All popular cards, banks & mobile banking in Bangladesh
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {PAYMENT_LOGOS.map((p) => (
                  <PaymentLogo key={p.alt} src={p.src} alt={p.alt} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-300/90">
            <p>© {new Date().getFullYear()} E‑Land. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white">
                Terms
              </Link>
              <Link to="/compliance" className="hover:text-white">
                Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
