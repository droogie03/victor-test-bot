import { PokemonRegions } from "./types";
import { REGIONMAPURLS } from "./constants";
import { MISSIGNO_URL } from "./constants";

const verifyPokemonUrl = (url: string): Promise<string> =>
  fetch(url).then((res) => {
    if (res.status === 200) {
      return url;
    } else {
      return MISSIGNO_URL;
    }
  });

const generatePokemonImageUrl = (pokemonName: string): Promise<string> =>
  verifyPokemonUrl(
    `https://img.pokemondb.net/artwork/large/${pokemonName.toLowerCase()}.jpg`
  );

const generateRegionMapUrl = (region: PokemonRegions): Promise<string> =>
  verifyPokemonUrl(REGIONMAPURLS[region]);

export const createMessage = async (
  monsterName: string,
  region: PokemonRegions,
  route: string
) => {
  const pokeImg = await generatePokemonImageUrl(monsterName);
  const regionMap = await generateRegionMapUrl(region);
  return [
    {
      type: "photo",
      media: pokeImg,
    },
    {
      type: "photo",
      media: regionMap,
      caption: `*¡${monsterName} ha aparecido!*\n📍 Región: ${region}\n🛣️ Ubicación: ${route}`,
      parse_mode: "Markdown",
    },
  ];
};
