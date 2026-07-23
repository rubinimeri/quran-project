"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { type TranslationResource } from "@quranjs/api";

import { Checkbox } from "@/components/ui/checkbox";
import { useTranslationsStore } from "@/stores/translations-store";
import {
  filterTranslations,
  groupTranslationsByLanguage,
} from "@/lib/translation-groups";

type TranslationsListProps = {
  translations: TranslationResource[];
};

/**
 * The translation picker as drawer content: a search box over a multi-select
 * checkbox list grouped by language, bound to the persisted `translations-store`.
 */
export function TranslationsList({ translations }: TranslationsListProps) {
  const [query, setQuery] = useState("");
  const selectedIds = useTranslationsStore((s) => s.selectedIds);
  const toggle = useTranslationsStore((s) => s.toggle);

  const groups = useMemo(
    () => groupTranslationsByLanguage(filterTranslations(translations, query)),
    [translations, query],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2.5 rounded-lg border border-border/50 bg-input/20 px-3">
        <IconSearch
          size={15}
          className="shrink-0 text-muted-foreground/60"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by language, name, or author…"
          aria-label="Search translations"
          className="w-full flex-1 bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1">
        {translations.length === 0 ? (
          <EmptyLine>Couldn&rsquo;t load translations.</EmptyLine>
        ) : groups.length === 0 ? (
          <EmptyLine>No translation matches &ldquo;{query}&rdquo;.</EmptyLine>
        ) : (
          groups.map((group) => (
            <section key={group.language}>
              <h3 className="px-3 pb-1.5 text-xs uppercase tracking-[0.2em] text-gold-muted">
                {group.language}
              </h3>
              <ul className="space-y-0.5">
                {group.items.map((translation) => {
                  const id = translation.id as number;
                  const checked = selectedIds.includes(id);
                  return (
                    <li key={id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(id)}
                          className="mt-0.5"
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm text-foreground/90">
                            {translation.name}
                          </span>
                          {translation.authorName &&
                          translation.authorName !== translation.name ? (
                            <span className="truncate text-xs text-muted-foreground/70">
                              {translation.authorName}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 py-6 text-center text-muted-foreground/60">{children}</p>
  );
}
