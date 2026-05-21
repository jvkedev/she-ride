import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const footerLinks = {
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Support", href: "#" },
  ],
  services: [
    { label: "Ride Booking", href: "#" },
    { label: "Women Drivers", href: "#" },
    { label: "Live Tracking", href: "#" },
    { label: "Emergency SOS", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Cookie & Policy", href: "#" },
    { label: "Accessibility", href: "#" },
  ],
};

const socialLinks = [
  { icon: FaFacebookF },
  { icon: FaInstagram },
  { icon: FaLinkedinIn },
  { icon: FaXTwitter },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12">
        {/* Top Footer */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-md space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logos/logo.png"
                alt="She Ride Logo"
                width={48}
                height={48}
                className="rounded-md"
              />
              <div>
                <h2 className="text-2xl font-extrabold text-primary">
                  She Ride
                </h2>

                <p className="text-sm text-muted-foreground">
                  Safe • Secured • Empowered
                </p>
              </div>
            </Link>

            <p className="text-base leading-7 text-muted-foreground">
              SheRide is a women-first ride-hailing platform focused on
              providing safer, smarter, and more comfortable travel experiences
              for women everywhere.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={index}
                    href="#"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-muted"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-foreground">Company</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-foreground">Services</h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-foreground">Contact</h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />

                <p className="text-muted-foreground">
                  300C, ITL-Twin Tower Third Floor above Bikanervala, nearby NSP
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />

                <p className="text-muted-foreground">support@sheride.com</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />

                <p>+91 92207 83636</p>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Footer */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} She Ride. All rights reserved.</p>

          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
