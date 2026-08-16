import { Linking } from "react-native";

export interface MappablePlace {
  name: string;
  state: string;
  city?: string;
  streetCity?: string;
  address?: string;
  zip?: string;
}

export function hospitalMapsQuery(place: MappablePlace): string {
  const parts = [place.address, place.city ?? place.streetCity, place.state, place.zip].filter(
    (part): part is string => Boolean(part && part.trim()),
  );
  return parts.length ? parts.join(", ") : `${place.name} ${place.state}`;
}

export function hospitalMapsUrl(place: MappablePlace): string {
  return `https://maps.google.com/?q=${encodeURIComponent(hospitalMapsQuery(place))}`;
}

export function openHospitalInMaps(place: MappablePlace): void {
  void Linking.openURL(hospitalMapsUrl(place));
}
