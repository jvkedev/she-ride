"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "../ui/button";

import Image from "next/image";

const navLinks = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Safety",
    href: "#safety",
  },
  {
    label: "Drivers",
    href: "#drivers",
  },
  {
    label: "Support",
    href: "#support",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/logo.png"
            alt="She Ride Logo"
            width={44}
            height={44}
            className="rounded-md"
          />

          <div className="leading-tight">
            <h1 className="text-xl font-bold text-primary">She Ride</h1>
            <p className="text-[10px] font-medium text-muted-foreground">
              Safe · Secured · Empowered
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>

          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        {/* Mobile */}
        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 w-full shadow-md md:hidden">
            <div className="flex flex-col gap-4 px-6 py-4">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} onClick={closeMenu}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
