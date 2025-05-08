import type { User } from "@prisma/client";
import { langList } from "../lib/langList";
import { prisma } from "../prisma";
import type { Location } from "@prisma/client";
import { incrementHeat } from "./map.services";

export const translateToAll = async (text: string) => {
  await Promise.all(
    langList.map(async (lang) => {
      try {
        await translateText(text, lang.code);
      } catch (error) {
        console.error(
          `Erreur lors de la traduction en ${lang.name} (${lang.code}):`,
          error
        );
      }
    })
  );
};

export async function translateText(
  q: string,
  target: string
): Promise<string | null> {
  const url = "http://176.57.188.243:5000";

  // Vérifie si la traduction existe déjà dans la base de données
  const translation = await prisma.tranlation.findFirst({
    where: {
      original: q,
      targetLang: target,
    },
  });

  if (translation) {
    return translation.result;
  } else {
    // Encode la chaîne en UTF-8
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(q);
    const utf8EncodedQ = new TextDecoder("utf-8").decode(utf8Bytes);

    // Appel à l'API de traduction
    const translateResponse = await fetch(`${url}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: utf8EncodedQ,
        source: "auto",
        target,
      }),
    });

    // Gestion des erreurs de requête
    if (!translateResponse.ok) {
      console.error("Erreur lors de la traduction");
      return null;
    }

    const translateData = await translateResponse.json();
    const translatedText = translateData.translatedText ?? null;

    if (translatedText) {
      await prisma.tranlation.create({
        data: {
          original: q,
          targetLang: target,
          result: translatedText,
        },
      });
    }

    return translatedText;
  }
}

export const publish = async (
  userId: string,
  media: string[],
  categories: string[],
  content: string,
  type: string,
  videoUrl: string,
  location: Location | null
) => {
  let newLocation: Location | null = null;
  if (location) {
    newLocation = await prisma.location.findFirst({
      where: {
        place_id: location.place_id,
      },
    });
    if (!newLocation) {
      newLocation = await prisma.location.create({
        data: {
          lat: location.lat,
          lon: location.lon,
          name: location.name,
          display_name: location.display_name,
          place_id: location.place_id,
          type: location.type,
        },
      });
    }
  }
  const publication = await prisma.publication.create({
    data: {
      userId,
      media,
      categories,
      content,
      type,
      videoUrl,
      locationName: location ? location.name : "",
      locationDisplayName: location ? location.display_name : "",
    },
  });

  if (publication && location) {
    await prisma.publicationLocation.create({
      data: {
        publicationId: publication.id,
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon),
        type: type,
      },
    });
    await incrementHeat(parseFloat(location.lon), parseFloat(location.lat));
  }
  translateToAll(content);
};

export const sharePublication = async (
  userId: string,
  publicationId: string,
  content: string
) => {
  const originalPublication = await prisma.publication.update({
    where: { id: publicationId },
    include: {
      user: true,
    },
    data: {
      isShareCount: { increment: 1 },
    },
  });
  if (!originalPublication) {
    throw new Error("Publication not found");
  }

  const sharedPublication = await prisma.publication.create({
    data: {
      userId,
      media: originalPublication.media,
      categories: originalPublication.categories,
      originPublicationId: originalPublication.id,
      originContent: originalPublication.content,
      originUserId: originalPublication.userId,
      originCreatedAt: originalPublication.createdAt,
      originUsername: originalPublication.user.username,
      originUserImage: originalPublication.user.image,
      content,
      type: originalPublication.type,
      videoUrl: originalPublication.videoUrl,
      locationName: originalPublication.locationName,
      locationDisplayName: originalPublication.locationDisplayName,
      isShare: true,
    },
  });
  translateToAll(content);
  return sharedPublication;
};
