import type { Libraries } from "@react-google-maps/api";

/**
 * One loader config for every page with a Google map: the loader throws if two
 * pages ask for it with different options during the same visit.
 */
export const GOOGLE_MAPS_LOADER = {
  id: "google-map-script",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  libraries: ["places"] as Libraries,
};

export const NIGERIA_CENTER = { lat: 9.082, lng: 8.6753 };

export const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

/** A place in the shape the location form needs — same as the server's /geo responses. */
export type GeoPlace = {
  label: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
};

type Component = { name: string; types: string[] };

/** Splits Google address components into street / city / state / country. */
export function placeFromComponents(components: Component[], label: string, lat: number, lng: number): GeoPlace {
  const pick = (...types: string[]) =>
    types.map((t) => components.find((c) => c.types.includes(t))?.name).find(Boolean) ?? "";
  const street = [pick("street_number"), pick("route")].filter(Boolean).join(" ");
  return {
    label,
    address: street || pick("premise", "point_of_interest", "establishment", "neighborhood", "sublocality"),
    city: pick("locality", "postal_town", "administrative_area_level_2", "sublocality"),
    state: pick("administrative_area_level_1"),
    country: pick("country"),
    lat,
    lng,
  };
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number) {
  return km < 1 ? "< 1 km" : km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
