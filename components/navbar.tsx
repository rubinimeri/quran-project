import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const navLinks = [
  { label: "Read", href: "/" },
  { label: "Salah", href: "/salah" },
  { label: "Du'ā", href: "/dua" },
  { label: "Tasbeeh", href: "/tasbeeh" },
];

export function Navbar() {
  return (
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

        {/* Search — centre, grows */}
        <div className="flex-1 max-w-sm mx-auto">
          <InputGroup className="h-8 bg-muted/20 border-border/40 hover:border-border/70 transition-colors">
            <InputGroupAddon align="inline-start" className="pl-2.5">
              <IconSearch size={13} className="text-muted-foreground/60" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search surahs, verses…"
              className="text-xs placeholder:text-muted-foreground/40"
              readOnly
            />
          </InputGroup>
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
      </div>
    </header>
  );
}
