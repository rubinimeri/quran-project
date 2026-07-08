"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchDialog } from "@/components/search-dialog";
import { shouldHideNavbar, isSurahPath } from "@/lib/navbar-scroll";
import { useNavVisibilityStore } from "@/stores/nav-visibility-store";
import { cn } from "@/lib/utils";

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
  // Shared with the surah toolbar so both bars move in lockstep on scroll.
  const hidden = useNavVisibilityStore((s) => s.hidden);
  const setHidden = useNavVisibilityStore((s) => s.setHidden);
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

  // Auto-hide the navbar on scroll-down, but only on surah pages and never
  // while the mobile menu is open (its close control must stay reachable).
  const autoHide = isSurahPath(pathname) && !menuOpen;

  useEffect(() => {
    if (!autoHide) return;

    // Reveal the navbar on entry and whenever we navigate to a new surah.
    setHidden(false);

    // Compute synchronously in the scroll handler rather than inside
    // requestAnimationFrame: iOS Safari defers rAF callbacks until a touch
    // scroll settles, which would freeze the navbar mid-gesture. setHidden is
    // only called when the visibility actually flips, so this stays cheap.
    let lastY = window.scrollY;
    let currentlyHidden = false;

    function onScroll() {
      const currentY = window.scrollY;
      const next = shouldHideNavbar({
        currentY,
        lastY,
        wasHidden: currentlyHidden,
      });
      lastY = currentY;
      if (next !== currentlyHidden) {
        currentlyHidden = next;
        setHidden(next);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [autoHide, pathname, setHidden]);

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
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border/30 bg-background/70 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          autoHide && hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Wordmark */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0">
            <span
              className="text-xl font-light tracking-wide text-gold font-display"
            >
              Nur
            </span>
            <span
              className="text-base text-gold-muted/80 font-arabic"
              lang="ar"
              dir="rtl"
            >
              نور
            </span>
          </Link>

          {/* Search trigger — grouped right with actions */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="hidden sm:flex ml-auto group h-8 items-center gap-2 rounded-full border border-border bg-muted/40 pl-3 pr-2 transition-colors duration-200 ease-out hover:border-gold/50 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <IconSearch
              size={14}
              className="text-muted-foreground transition-colors group-hover:text-gold"
            />
            <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
              Search
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <span className="text-[11px] leading-none">⌘</span>K
            </kbd>
          </button>

          {/* Right zone — nav links, theme, mobile toggle */}
          <div className="ml-auto sm:ml-0 flex items-center gap-1">
            <nav className="hidden sm:flex items-center gap-0.5">
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
            <button
              type="button"
              onClick={openSearchFromMenu}
              aria-label="Open search"
              className="ml-auto w-8 h-8 flex sm:hidden items-center justify-center text-muted-foreground/70 hover:text-gold transition-colors"
            >
              <IconSearch size={18} />
            </button>

            {/* Theme toggle — visible on all breakpoints */}
            <ThemeToggle />

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
                  className={cn(
                    "absolute left-0 top-0 w-4 h-px bg-foreground/80 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    menuOpen && "translate-y-[7px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 bottom-0 w-4 h-px bg-foreground/80 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    menuOpen && "-translate-y-[7px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
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
                className="text-xl font-light tracking-wide text-gold font-display"
              >
                Nur
              </span>
              <span
                className="text-base text-gold-muted/80 font-arabic"
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

            <ThemeToggle />

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
                  className={cn(
                    "fade-up text-4xl tracking-wide transition-colors font-display",
                    MENU_STAGGER[Math.min(index, MENU_STAGGER.length - 1)],
                    isActive
                      ? "text-gold"
                      : "text-foreground/80 hover:text-gold",
                  )}
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
