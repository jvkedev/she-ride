"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Safety", href: "/#safety" },
  { label: "Drivers", href: "/#drivers" },
  { label: "Support", href: "/#support" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
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
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-foreground md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {open ? (
          <div className="absolute top-full right-0 left-0 border-b border-border bg-background shadow-md md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className={cn("mt-3 flex flex-col gap-2 border-t border-border pt-4")}>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={closeMenu}>
                    Login
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/signup" onClick={closeMenu}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
