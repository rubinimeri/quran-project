import { stripHtmlTags } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { versePage } from "@/lib/verses";
import { VerseActions } from "./verse-actions";

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
  articleRef?: (el: HTMLElement | null) => void;
};

function Bar({ className }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className ?? ""}`} />;
}

export function Ayah({
  verseNumber,
  loading = false,
  textUthmani = "",
  translations = [],
  highlighted = false,
  articleRef,
}: AyahProps) {
  return (
    <article
      id={`verse-${verseNumber}`}
      data-page={versePage(verseNumber)}
      ref={articleRef}
      aria-busy={loading || undefined}
      className={`${loading ? "" : "fade-up"} ${highlighted ? "verse-highlight" : ""} group relative flex flex-col gap-5 py-8 border-b border-border/40 last:border-0`}
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
        </>
      )}
    </article>
  );
}
