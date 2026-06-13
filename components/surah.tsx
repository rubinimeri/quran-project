import { TranslatedName } from "@quranjs/api";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { Badge } from "./ui/badge";
import Link from "next/link";

type SurahProps = {
  name: string;
  ayahs: number;
  arabicName: string;
  translatedName: TranslatedName;
  order: number;
};

function Surah({ name, ayahs, arabicName, translatedName, order }: SurahProps) {
  return (
    <Link href={`/${order}`}>
      <Item variant={"outline"} className="">
        <Badge className="font-bold">{order}</Badge>
        <ItemContent>
          <ItemTitle>{name}</ItemTitle>
          <ItemDescription>{translatedName.name}</ItemDescription>
        </ItemContent>
        <ItemContent>
          <ItemTitle>{arabicName}</ItemTitle>
          <ItemDescription className="">{ayahs} Ayahs</ItemDescription>
        </ItemContent>
      </Item>
    </Link>
  );
}

export default Surah;
