"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchDialog } from "@/components/search-dialog";

const navLinks = [
  { label: "Read", href: "/" },
  { label: "Salah", href: "/salah" },
  { label: "Du'ā", href: "/dua" },
  { label: "Tasbeeh", href: "/tasbeeh" },
];

const MENU_STAGGER = ["", "delay-100", "delay-200", "delay-300"];

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuToggleRef.current?.focus();
  }

  function openSearchFromMenu() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Wordmark */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0 mr-2">
            <span
              className="text-xl font-light tracking-wide text-gold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Nur
            </span>
            <span
              className="text-base text-gold-muted/80"
              style={{ fontFamily: "var(--font-arabic)" }}
              lang="ar"
              dir="rtl"
            >
              نور
            </span>
          </Link>

          {/* Search trigger — centre, grows */}
          <div className="flex-1 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full"
              aria-label="Open search"
            >
              <InputGroup className="h-8 bg-muted/20 border-border/40 hover:border-border/70 transition-colors pointer-events-none">
                <InputGroupAddon align="inline-start" className="pl-2.5">
                  <IconSearch size={13} className="text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search surahs, verses…"
                  className="text-xs placeholder:text-muted-foreground/40"
                  readOnly
                  tabIndex={-1}
                />
                <InputGroupAddon align="inline-end" className="pr-2.5">
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono rounded border border-border/40 bg-muted/20 text-muted-foreground/40">
                    <span>⌘</span>K
                  </kbd>
                </InputGroupAddon>
              </InputGroup>
            </button>
          </div>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden sm:flex items-center gap-0.5 shrink-0">
            {navLinks.map(({ label, href }) => (
              <Button
                key={label}
                variant="ghost"
                size="sm"
                className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-gold hover:bg-transparent px-3"
                render={<Link href={href} />}
                nativeButton={false}
              >
                {label}
              </Button>
            ))}
          </nav>

          {/* Mobile menu toggle — hidden on desktop */}
          <button
            ref={menuToggleRef}
            type="button"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="sm:hidden shrink-0 w-8 h-8 flex items-center justify-center"
          >
            <span className="relative w-4 h-3.5 block">
              <span
                className={`absolute left-0 top-0 w-4 h-px bg-foreground/80 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 bottom-0 w-4 h-px bg-foreground/80 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="sm:hidden fade-soft fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex flex-col"
        >
          <div className="max-w-6xl mx-auto w-full px-4 h-14 flex items-center gap-4 shrink-0">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-baseline gap-2 shrink-0 mr-2"
            >
              <span
                className="text-xl font-light tracking-wide text-gold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Nur
              </span>
              <span
                className="text-base text-gold-muted/80"
                style={{ fontFamily: "var(--font-arabic)" }}
                lang="ar"
                dir="rtl"
              >
                نور
              </span>
            </Link>

            <div className="flex-1" />

            <button
              type="button"
              onClick={openSearchFromMenu}
              aria-label="Open search"
              className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 hover:text-gold transition-colors"
            >
              <IconSearch size={18} />
            </button>

            <button
              ref={menuCloseRef}
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="relative w-8 h-8 shrink-0 flex items-center justify-center"
            >
              <span className="relative w-4 h-3.5 block">
                <span className="absolute left-0 top-0 w-4 h-px bg-foreground/80 translate-y-[7px] rotate-45" />
                <span className="absolute left-0 bottom-0 w-4 h-px bg-foreground/80 -translate-y-[7px] -rotate-45" />
              </span>
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-7">
            {navLinks.map(({ label, href }, index) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className={`fade-up ${MENU_STAGGER[Math.min(index, MENU_STAGGER.length - 1)]} text-4xl tracking-wide transition-colors ${
                    isActive
                      ? "text-gold"
                      : "text-foreground/80 hover:text-gold"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {label}
                </Link>
              );
            })}
            <span
              className="fade-soft delay-400 mt-2 text-gold-muted/40 text-lg"
              aria-hidden="true"
            >
              ❖
            </span>
          </nav>
        </div>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
