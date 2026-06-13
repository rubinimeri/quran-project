import { createServerClient } from "@quranjs/api/server";

const client = createServerClient({
  clientId: process.env.QURAN_CLIENT_ID!,
  clientSecret: process.env.QURAN_CLIENT_SECRET!,
});

export default client;
