import { prisma } from "../prisma";

/**
 * Calcul de la distance en mètres entre deux points géographiques.
 * @param lat1 Latitude du point 1
 * @param lon1 Longitude du point 1
 * @param lat2 Latitude du point 2
 * @param lon2 Longitude du point 2
 * @returns La distance en mètres
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180; // Conversion en radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance en mètres
};

export const incrementHeat = async (longitude: number, latitude: number) => {
  // Récupérer tous les points pour effectuer un filtrage local
  const allPoints = await prisma.addressPointHeat.findMany();

  // Trouver un point dans un rayon de 200 mètres
  const nearbyPoint = allPoints.find((point) => {
    if (point.latitude && point.longitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        point.latitude,
        point.longitude
      );
      return distance <= 200; // Filtrer les points dans un rayon de 200m
    }
    return false;
  });

  if (nearbyPoint) {
    // Si un point existe dans le rayon, incrémentez la température
    const updatedPoint = await prisma.addressPointHeat.update({
      where: { id: nearbyPoint.id },
      data: {
        temps: Number(nearbyPoint.temps || 0) + 1,
      },
    });
    return { message: "temps incremented", point: updatedPoint };
  } else {
    // Si aucun point n'existe, créez un nouveau point avec une température de 1
    const newPoint = await prisma.addressPointHeat.create({
      data: {
        longitude,
        latitude,
        temps: 1,
      },
    });
    return { message: "New point created", point: newPoint };
  }
};

export const decrementHeat = async (longitude: number, latitude: number) => {
  // Récupérer tous les points pour effectuer un filtrage local
  const allPoints = await prisma.addressPointHeat.findMany();
  // Trouver un point dans un rayon de 200 mètres
  const nearbyPoint = allPoints.find((point) => {
    if (point.latitude && point.longitude) {
      const distance = calculateDistance(
        latitude,
        longitude,
        point.latitude,
        point.longitude
      );
      return distance <= 200; // Filtrer les points dans un rayon de 200m
    }
    return false;
  });
  if (nearbyPoint && nearbyPoint.temps && nearbyPoint.temps > 0) {
    // Si un point existe dans le rayon et que son temps est > 0, décrémentez la température
    const updatedPoint = await prisma.addressPointHeat.update({
      where: { id: nearbyPoint.id },
      data: {
        temps: Number(nearbyPoint.temps) - 1,
      },
    });
    // Si le temps atteint 0, supprimer le point
    if (updatedPoint.temps === 0) {
      await prisma.addressPointHeat.delete({
        where: { id: nearbyPoint.id },
      });
      return { message: "Point removed (temps reached 0)", point: null };
    }
    return { message: "temps decremented", point: updatedPoint };
  }
  return {
    message: "No nearby point found or temps already at 0",
    point: null,
  };
};
