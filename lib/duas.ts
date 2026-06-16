export type DuaCategory =
  | "morning"
  | "evening"
  | "quranic"
  | "distress"
  | "gratitude"
  | "daily";

export type Dua = {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category: DuaCategory;
  occasions?: string;
};

export const DUA_CATEGORIES: { id: DuaCategory; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "evening", label: "Evening" },
  { id: "quranic", label: "Qur'ānic" },
  { id: "distress", label: "Distress" },
  { id: "gratitude", label: "Gratitude" },
  { id: "daily", label: "Daily Life" },
];

export const DUAS: Dua[] = [
  // ── Morning ──────────────────────────────────────────────
  {
    id: "morning-mulk",
    arabic:
      "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Asbahnā wa asbahal-mulku lillāh, wal-hamdu lillāh, lā ilāha illallāhu wahdahu lā sharīka lah.",
    translation:
      "We have entered the morning and at this very time the whole kingdom belongs to Allah. All praise is for Allah. There is no god but Allah, alone, without partner.",
    reference: "Muslim",
    category: "morning",
    occasions: "Upon rising · Morning adhkār",
  },
  {
    id: "morning-sayyid-istighfar",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    transliteration:
      "Allāhumma anta Rabbī lā ilāha illā anta, khalaqtanī wa anā ʿabduka, wa anā ʿalā ʿahdika wa waʿdika mas-tataʿtu.",
    translation:
      "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. (The chief of seeking forgiveness)",
    reference: "Bukhārī",
    category: "morning",
    occasions: "Morning & evening · The sayyid al-istighfār",
  },
  {
    id: "morning-afiyah",
    arabic:
      "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
    transliteration:
      "Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī basarī, lā ilāha illā anta.",
    translation:
      "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. There is no god but You.",
    reference: "Abū Dāwūd",
    category: "morning",
    occasions: "Morning & evening · Repeated 3×",
  },
  {
    id: "morning-fitrah",
    arabic:
      "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
    transliteration:
      "Asbahnā ʿalā fitratil-Islām, wa ʿalā kalimatil-ikhlās, wa ʿalā dīni Nabiyyinā Muhammadin sallallāhu ʿalayhi wa sallam.",
    translation:
      "We rise upon the natural way of Islam, the word of sincere devotion, and the religion of our Prophet Muhammad, may Allah's peace and blessings be upon him.",
    reference: "Ahmad",
    category: "morning",
    occasions: "Upon rising",
  },
  {
    id: "morning-shukr",
    arabic:
      "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    transliteration:
      "Allāhumma mā asbaha bī min niʿmatin aw bi-ahadin min khalqika faminka wahdaka lā sharīka lak, falakal-hamdu wa lakash-shukr.",
    translation:
      "O Allah, whatever blessing has come to me or to any of Your creation this morning is from You alone, without partner, so all praise and thanks are due to You.",
    reference: "Abū Dāwūd",
    category: "morning",
    occasions: "Each morning",
  },

  // ── Evening ──────────────────────────────────────────────
  {
    id: "evening-mulk",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:
      "Amsaynā wa amsal-mulku lillāh, wal-hamdu lillāh, lā ilāha illallāhu wahdahu lā sharīka lah.",
    translation:
      "We have entered the evening and at this very time the whole kingdom belongs to Allah. All praise is for Allah. There is no god but Allah, alone, without partner.",
    reference: "Muslim",
    category: "evening",
    occasions: "At the onset of evening",
  },
  {
    id: "evening-kalimat",
    arabic:
      "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "Aʿūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq.",
    translation:
      "I seek refuge in the perfect words of Allah from the evil of what He has created. (Said three times in the evening)",
    reference: "Muslim",
    category: "evening",
    occasions: "Each evening · Repeated 3×",
  },
  {
    id: "evening-bika-amsayna",
    arabic:
      "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliteration:
      "Allāhumma bika amsaynā, wa bika asbahnā, wa bika nahyā, wa bika namūtu, wa ilaykal-masīr.",
    translation:
      "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.",
    reference: "Tirmidhī",
    category: "evening",
    occasions: "Morning & evening",
  },
  {
    id: "evening-aafiyah-dunya-akhirah",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration:
      "Allāhumma innī as'alukal-ʿafwa wal-ʿāfiyata fid-dunyā wal-ākhirah.",
    translation:
      "O Allah, I ask You for pardon and well-being in this world and the Hereafter.",
    reference: "Abū Dāwūd",
    category: "evening",
    occasions: "Morning & evening",
  },
  {
    id: "evening-protection-night",
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، وَأَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    transliteration:
      "Allāhumma innī aʿūdhu bika minal-kasali wa sū'il-kibar, wa aʿūdhu bika min ʿadhābin fin-nāri wa ʿadhābin fil-qabr.",
    translation:
      "O Allah, I seek refuge in You from laziness and the misery of old age, and I seek refuge in You from the punishment of the Fire and the punishment of the grave.",
    reference: "Muslim",
    category: "evening",
    occasions: "Morning & evening",
  },

  // ── Qur'ānic (Rabbanā duas) ──────────────────────────────
  {
    id: "quranic-dunya-akhirah",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbanā ātinā fid-dunyā hasanatan wa fil-ākhirati hasanatan wa qinā ʿadhāban-nār.",
    translation:
      "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    reference: "Qur'ān 2:201",
    category: "quranic",
    occasions: "After prayer · Anytime",
  },
  {
    id: "quranic-la-tuzigh",
    arabic:
      "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",
    transliteration:
      "Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā min ladunka rahmah, innaka antal-Wahhāb.",
    translation:
      "Our Lord, let not our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed, You are the Bestower.",
    reference: "Qur'ān 3:8",
    category: "quranic",
    occasions: "After prayer · Anytime",
  },
  {
    id: "quranic-afrigh-sabr",
    arabic:
      "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    transliteration:
      "Rabbanā afrigh ʿalaynā sabran wa thabbit aqdāmanā wansurnā ʿalal-qawmil-kāfirīn.",
    translation:
      "Our Lord, pour upon us patience, make our steps firm, and grant us victory over the disbelieving people.",
    reference: "Qur'ān 2:250",
    category: "quranic",
    occasions: "In times of hardship",
  },
  {
    id: "quranic-rabbi-zidni-ilma",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidnī ʿilmā.",
    translation: "My Lord, increase me in knowledge.",
    reference: "Qur'ān 20:114",
    category: "quranic",
    occasions: "Before study · Anytime",
  },
  {
    id: "quranic-ishrah-sadri",
    arabic:
      "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
    transliteration:
      "Rabbish-rah lī sadrī wa yassir lī amrī wahlul ʿuqdatan min lisānī yafqahū qawlī.",
    translation:
      "My Lord, expand for me my chest, ease for me my task, and untie the knot from my tongue that they may understand my speech.",
    reference: "Qur'ān 20:25–28",
    category: "quranic",
    occasions: "Before speaking or teaching",
  },
  {
    id: "quranic-qurrata-ayun",
    arabic:
      "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration:
      "Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyunin wajʿalnā lil-muttaqīna imāmā.",
    translation:
      "Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us a model for the righteous.",
    reference: "Qur'ān 25:74",
    category: "quranic",
    occasions: "For family · Anytime",
  },

  // ── Distress & Relief ────────────────────────────────────
  {
    id: "distress-yunus",
    arabic:
      "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration:
      "Lā ilāha illā anta subhānaka innī kuntu minaz-zālimīn.",
    translation:
      "There is no god but You; glory be to You. Indeed, I have been among the wrongdoers. (The supplication of Yūnus)",
    reference: "Qur'ān 21:87",
    category: "distress",
    occasions: "In distress · Repeat often",
  },
  {
    id: "distress-hasbunallah",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallāhu wa niʿmal-wakīl.",
    translation: "Allah is sufficient for us, and He is the best Disposer of affairs.",
    reference: "Qur'ān 3:173",
    category: "distress",
    occasions: "In times of difficulty",
  },
  {
    id: "distress-azim-halim",
    arabic:
      "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    transliteration:
      "Lā ilāha illallāhul-ʿAzīmul-Halīm, lā ilāha illallāhu Rabbul-ʿArshil-ʿAzīm, lā ilāha illallāhu Rabbus-samāwāti wa Rabbul-ardi wa Rabbul-ʿArshil-Karīm.",
    translation:
      "There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the Magnificent Throne. There is no god but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.",
    reference: "Bukhārī & Muslim",
    category: "distress",
    occasions: "In anxiety or hardship",
  },
  {
    id: "distress-rahmataka-arju",
    arabic:
      "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ",
    transliteration:
      "Allāhumma rahmataka arjū falā takilnī ilā nafsī tarfata ʿaynin, wa aslih lī sha'nī kullah, lā ilāha illā anta.",
    translation:
      "O Allah, it is Your mercy that I hope for, so do not leave me to myself even for the blink of an eye, and set right all my affairs. There is no god but You.",
    reference: "Abū Dāwūd",
    category: "distress",
    occasions: "In times of anxiety",
  },
  {
    id: "distress-ya-hayyu-qayyum",
    arabic:
      "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration:
      "Yā Hayyu yā Qayyūmu bi-rahmatika astaghīth, aslih lī sha'nī kullah, wa lā takilnī ilā nafsī tarfata ʿayn.",
    translation:
      "O Ever-Living, O Sustainer, by Your mercy I seek relief. Set right all my affairs, and do not leave me to myself even for the blink of an eye.",
    reference: "Nasā'ī",
    category: "distress",
    occasions: "After Fajr · In distress",
  },

  // ── Gratitude & Praise ───────────────────────────────────
  {
    id: "gratitude-dhikr-shukr",
    arabic:
      "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliteration:
      "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa husni ʿibādatik.",
    translation:
      "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
    reference: "Abū Dāwūd",
    category: "gratitude",
    occasions: "After each prayer",
  },
  {
    id: "gratitude-nimah-tatimmu",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    transliteration: "Al-hamdu lillāhil-ladhī bi-niʿmatihi tatimmus-sālihāt.",
    translation: "All praise is for Allah, by whose favour good deeds are completed.",
    reference: "Ibn Mājah",
    category: "gratitude",
    occasions: "Upon receiving a blessing",
  },
  {
    id: "gratitude-subhanallah-bihamdihi",
    arabic:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhānallāhi wa bihamdih, subhānallāhil-ʿAzīm.",
    translation:
      "Glory be to Allah and praise Him; glory be to Allah, the Most Great.",
    reference: "Bukhārī & Muslim",
    category: "gratitude",
    occasions: "Morning & evening · 100×",
  },
  {
    id: "gratitude-awzini-ashkura",
    arabic:
      "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
    transliteration:
      "Rabbi awziʿnī an ashkura niʿmatakal-latī anʿamta ʿalayya wa ʿalā wālidayya wa an aʿmala sālihan tardāh.",
    translation:
      "My Lord, enable me to be grateful for Your favour which You have bestowed upon me and upon my parents, and to do righteousness of which You approve.",
    reference: "Qur'ān 27:19",
    category: "gratitude",
    occasions: "Anytime",
  },

  // ── Daily Life ───────────────────────────────────────────
  {
    id: "daily-sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allāhumma amūtu wa ahyā.",
    translation: "In Your name, O Allah, I die and I live. (Before sleeping)",
    reference: "Bukhārī",
    category: "daily",
    occasions: "Before sleeping",
  },
  {
    id: "daily-waking",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration:
      "Al-hamdu lillāhil-ladhī ahyānā baʿda mā amātanā wa ilayhin-nushūr.",
    translation:
      "All praise is for Allah who gave us life after He caused us to die, and to Him is the resurrection. (Upon waking)",
    reference: "Bukhārī",
    category: "daily",
    occasions: "Upon waking",
  },
  {
    id: "daily-leaving-home",
    arabic:
      "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration:
      "Bismillāh, tawakkaltu ʿalallāh, wa lā hawla wa lā quwwata illā billāh.",
    translation:
      "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah. (When leaving home)",
    reference: "Abū Dāwūd & Tirmidhī",
    category: "daily",
    occasions: "When leaving home",
  },
  {
    id: "daily-before-eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillāh.",
    translation:
      "In the name of Allah. (Before eating; if forgotten, say: Bismillāhi awwalahu wa ākhirah)",
    reference: "Abū Dāwūd & Tirmidhī",
    category: "daily",
    occasions: "Before eating",
  },
  {
    id: "daily-after-eating",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration:
      "Al-hamdu lillāhil-ladhī atʿamanī hādhā wa razaqanīhi min ghayri hawlin minnī wa lā quwwah.",
    translation:
      "All praise is for Allah who fed me this and provided it for me without any might or power on my part. (After eating)",
    reference: "Tirmidhī",
    category: "daily",
    occasions: "After eating",
  },
  {
    id: "daily-travel",
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration:
      "Subhānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā Rabbinā lamunqalibūn.",
    translation:
      "Glory be to the One who has placed this in our service, and we ourselves were not capable of it. And indeed, to our Lord we will surely return. (When travelling)",
    reference: "Qur'ān 43:13–14",
    category: "daily",
    occasions: "When travelling",
  },
];

export function getDuasByCategory(category: DuaCategory): Dua[] {
  return DUAS.filter((dua) => dua.category === category);
}
