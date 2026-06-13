export interface MapLinkSet {
  google: string;
  apple: string;
  gaode: string;
}

export function getMapLinks(lat: number, lng: number, name?: string): MapLinkSet {
  const label = name ? encodeURIComponent(name) : `${lat},${lng}`;
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    apple: `https://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
    gaode: `https://uri.amap.com/marker?position=${lng},${lat}&name=${label}`,
  };
}
