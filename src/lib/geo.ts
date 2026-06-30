export function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceInMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const earthRadiusMeters = 6371000;
  const deltaLatitude = degreesToRadians(latitudeB - latitudeA);
  const deltaLongitude = degreesToRadians(longitudeB - longitudeA);
  const latitudeARadians = degreesToRadians(latitudeA);
  const latitudeBRadians = degreesToRadians(latitudeB);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeARadians) * Math.cos(latitudeBRadians) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getBoundingBox(latitude: number, longitude: number, radiusMeters: number) {
  const latitudeDelta = radiusMeters / 111320;
  const longitudeDelta = radiusMeters / (111320 * Math.cos(degreesToRadians(latitude)));

  return {
    minLatitude: latitude - latitudeDelta,
    maxLatitude: latitude + latitudeDelta,
    minLongitude: longitude - longitudeDelta,
    maxLongitude: longitude + longitudeDelta,
  };
}
