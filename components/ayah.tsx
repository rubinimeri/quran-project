import { stripHtmlTags } from "@/lib/format";
import { Separator } from "@/components/ui/separator";
import { VerseActions } from "./verse-actions";

type AyahTranslation = {
  text: string;
  resourceName?: string;
};

type AyahProps = {
  verseNumber: number;
  textUthmani: string;
  translations: AyahTranslation[];
};

export function Ayah({ verseNumber, textUthmani, translations }: AyahProps) {
  return (
    <article className="group relative flex flex-col gap-5 py-8 border-b border-border/40 last:border-0">
      {/* Verse number medallion */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold text-xs font-semibold shrink-0">
          {verseNumber}
        </div>
        <Separator className="flex-1 bg-gold-muted/15" />

        <VerseActions
          arabic={textUthmani}
          translations={translations.map((t) => stripHtmlTags(t.text))}
        />
      </div>

      {/* Arabic text */}
      <p
        className="text-right text-3xl leading-[2.2] text-foreground"
        style={{ fontFamily: "var(--font-arabic)" }}
        lang="ar"
        dir="rtl"
      >
        {textUthmani}
      </p>

      {/* Translations */}
      <div className="flex flex-col gap-4">
        {translations.map((t, i) => (
          <div key={i} className="flex flex-col gap-1">
            {t.resourceName && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
                {t.resourceName}
              </span>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stripHtmlTags(t.text)}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
