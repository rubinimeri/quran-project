import { stripHtmlTags } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { versePage } from "@/lib/verses";
import { VerseActions } from "./verse-actions";
import { Button } from "./ui/button";
import { IconBook } from "@tabler/icons-react";

type AyahTranslation = {
  text: string;
  resourceName?: string;
};

type AyahProps = {
  verseNumber: number;
  loading?: boolean;
  textUthmani?: string;
  translations?: AyahTranslation[];
  highlighted?: boolean;
  active?: boolean;
  onPlay?: () => void;
  onOpenTafsir?: () => void;
  articleRef?: (el: HTMLElement | null) => void;
  /**
   * Render as the header inside the tafsir dialog: drop the list-only id /
   * scroll wiring and hide the verse actions (play, copy, tafsir trigger).
   */
  asHeader?: boolean;
};

function Bar({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

const HEADER_HEIGHT_PX = 77;

export function Ayah({
  verseNumber,
  loading = false,
  textUthmani = "",
  translations = [],
  highlighted = false,
  active = false,
  onPlay,
  onOpenTafsir,
  articleRef,
  asHeader = false,
}: AyahProps) {
  return (
    <article
      id={asHeader ? undefined : `verse-${verseNumber}`}
      data-page={asHeader ? undefined : versePage(verseNumber)}
      ref={asHeader ? undefined : articleRef}
      aria-busy={loading || undefined}
      aria-current={!asHeader && active ? "true" : undefined}
      style={asHeader ? undefined : { scrollMarginTop: HEADER_HEIGHT_PX }}
      className={`ayah-cv px-6 rounded-4xl ${loading ? "" : "fade-up"} ${!asHeader && highlighted ? "verse-active" : ""} ${!asHeader && active ? "verse-active" : ""} group relative flex flex-col gap-5 ${asHeader ? "pb-6" : "py-8 border-b border-border/40 last:border-0"}`}
    >
      {/* Verse number medallion */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-semibold shrink-0">
          {verseNumber}
        </div>
        <Separator className="flex-1 bg-gold-muted/15" />

        {!loading && (
          <VerseActions
            arabic={textUthmani}
            translations={translations.map((t) => stripHtmlTags(t.text))}
            onPlay={onPlay}
            active={active}
          />
        )}
      </div>

      {loading ? (
        <>
          {/* Arabic block — right-aligned, given the most room */}
          <div className="flex flex-col items-end gap-3">
            <Bar className="h-7 w-3/4" />
            <Bar className="h-7 w-5/6" />
          </div>

          {/* Translation — eyebrow label + lines of varied width */}
          <div className="flex flex-col gap-3">
            <Bar className="h-3 w-24" />
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-11/12" />
            <Bar className="h-4 w-2/3" />
          </div>
        </>
      ) : (
        <>
          {/* Arabic text */}
          <p
            className="text-right text-2xl sm:text-3xl md:text-4xl leading-[2.2] text-foreground font-medium"
            style={{ fontFamily: "var(--font-quran)" }}
            lang="ar"
            dir="rtl"
          >
            {textUthmani}
          </p>

          {/* Translations */}
          <div className="flex flex-col gap-4">
            {translations.map((t, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="font-medium leading-relaxed">
                  {stripHtmlTags(t.text)}
                </p>
                {t.resourceName && (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    {t.resourceName}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Tafsir — active (gold) when this ayah's tafsir is already open */}
          <button
            type="button"
            onClick={onOpenTafsir}
            aria-pressed={asHeader || undefined}
            aria-label={`Read tafsir for verse ${verseNumber}`}
            className={`text-sm font-medium w-max flex items-center gap-1 py-1 transition-colors focus-visible:opacity-100 ${
              asHeader ? "text-gold" : "text-muted-foreground hover:text-gold"
            }`}
          >
            <IconBook size={16} />
            Tafsirs
          </button>
        </>
      )}
    </article>
  );
}
