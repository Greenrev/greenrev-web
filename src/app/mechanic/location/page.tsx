"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, MarkerF, CircleF, useJsApiLoader } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User,
  MapPin,
  Calendar,
  Settings,
  Navigation,
  Check,
  Loader2,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  AlertTriangle,
  Crosshair,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { GOOGLE_MAPS_LOADER, NIGERIA_CENTER, darkMapStyle, placeFromComponents, type GeoPlace } from "@/lib/googleMaps";

const MECHANIC_NAV = [
  { name: "Overview", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/mechanic/profile", icon: User },
  { name: "Location", href: "/mechanic/location", icon: MapPin },
  { name: "Availability", href: "/mechanic/availability", icon: Calendar },
  { name: "Settings", href: "/mechanic/settings", icon: Settings },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const RADII = [
  { km: 5, label: "5 km" },
  { km: 10, label: "10 km" },
  { km: 25, label: "25 km" },
  { km: 50, label: "50 km" },
  { km: 100, label: "100 km" },
  { km: 0, label: "Anywhere" },
];

type Privacy = "exact" | "approximate";
type LocationForm = {
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number | null;
  lng: number | null;
  serviceRadiusKm: number;
  locationPrivacy: Privacy;
};

const EMPTY: LocationForm = {
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
  lat: null,
  lng: null,
  serviceRadiusKm: 25,
  locationPrivacy: "exact",
};

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-accent transition-colors";

// Lime teardrop pin with a dark centre.
const PIN_SVG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52"><path d="M20 51C20 51 38 32.6 38 20A18 18 0 0 0 2 20C2 32.6 20 51 20 51Z" fill="#A3E635" stroke="#050606" stroke-width="2"/><circle cx="20" cy="20" r="7" fill="#050606"/></svg>`
  );

type Suggestion = { id: string; label: string; resolve: () => Promise<GeoPlace | null> };

export default function MechanicLocationPage() {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER);
  const [saved, setSaved] = useState<LocationForm>(EMPTY);
  const [form, setForm] = useState<LocationForm>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [addressEdited, setAddressEdited] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const hasPin = form.lat != null && form.lng != null;
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const wasVisible = saved.lat != null && saved.lng != null;

  // ---------------------------------------------------------------- load

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest<{ profile: Record<string, unknown> }>("/api/v1/mechanic/profile");
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          const lat = Number(p.lat) || null;
          const lng = Number(p.lng) || null;
          const loaded: LocationForm = {
            address: String(p.address ?? ""),
            city: String(p.city ?? ""),
            state: String(p.state ?? ""),
            country: String(p.country || "Nigeria"),
            lat: lat && lng ? lat : null,
            lng: lat && lng ? lng : null,
            serviceRadiusKm: Number(p.serviceRadiusKm ?? 25),
            locationPrivacy: p.locationPrivacy === "approximate" ? "approximate" : "exact",
          };
          setForm(loaded);
          setSaved(loaded);
        }
      } catch {
        setNotice({ tone: "error", text: "We couldn't load your saved location. Refresh to try again." });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const geocoder = () => (geocoderRef.current ??= new google.maps.Geocoder());

  // ---------------------------------------------------------------- pin <-> address

  const panTo = (lat: number, lng: number, zoom = 16) => {
    mapRef.current?.panTo({ lat, lng });
    if ((mapRef.current?.getZoom() ?? 0) < zoom) mapRef.current?.setZoom(zoom);
  };

  /** Moving the pin is the source of truth: fill the address from wherever it lands. */
  const setPin = useCallback(async (lat: number, lng: number, opts: { pan?: boolean; fillAddress?: boolean } = {}) => {
    const la = Math.round(lat * 1e6) / 1e6;
    const ln = Math.round(lng * 1e6) / 1e6;
    setForm((f) => ({ ...f, lat: la, lng: ln }));
    setAddressEdited(false);
    if (opts.pan) panTo(la, ln);
    if (opts.fillAddress === false) return;
    setLookingUp(true);
    try {
      const { results } = await geocoder().geocode({ location: { lat: la, lng: ln } });
      const r = results[0];
      if (r) {
        const p = placeFromComponents(
          r.address_components.map((c) => ({ name: c.long_name, types: c.types })),
          r.formatted_address,
          la,
          ln
        );
        setForm((f) => ({ ...f, address: p.address || f.address, city: p.city || f.city, state: p.state || f.state, country: p.country || f.country }));
      }
    } catch {
      setNotice({ tone: "info", text: "Pin set. We couldn't look up the address there — type it in below." });
    } finally {
      setLookingUp(false);
    }
  }, []);

  const applyPlace = (p: GeoPlace) => {
    setForm((f) => ({ ...f, address: p.address, city: p.city || f.city, state: p.state || f.state, country: p.country || f.country, lat: p.lat, lng: p.lng }));
    setAddressEdited(false);
    panTo(p.lat, p.lng);
    setNotice({ tone: "info", text: "Check the pin sits on your workshop entrance — drag it if not." });
  };

  /** After typing an address by hand, the expert can move the pin to match it. */
  const pinFromAddress = async () => {
    const query = [form.address, form.city, form.state, form.country].filter(Boolean).join(", ");
    if (!query) return;
    setLookingUp(true);
    try {
      const { results } = await geocoder().geocode({ address: query, region: "ng" });
      const r = results[0];
      if (!r) throw new Error();
      setForm((f) => ({ ...f, lat: r.geometry.location.lat(), lng: r.geometry.location.lng() }));
      panTo(r.geometry.location.lat(), r.geometry.location.lng());
      setAddressEdited(false);
      setNotice({ tone: "info", text: "Pin moved to that address. Fine-tune it by dragging." });
    } catch {
      setNotice({ tone: "error", text: "We couldn't find that address. Try the search box, or drag the pin instead." });
    } finally {
      setLookingUp(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setNotice({ tone: "error", text: "This browser can't share your location. Search for your address instead." });
      return;
    }
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setPin(pos.coords.latitude, pos.coords.longitude, { pan: true });
        setLocating(false);
        setNotice({
          tone: "info",
          text:
            pos.coords.accuracy > 150
              ? `Your device placed you within about ${Math.round(pos.coords.accuracy)} m — drag the pin to your exact spot.`
              : "Found you. Drag the pin if it's not quite on your workshop.",
        });
      },
      (err) => {
        setLocating(false);
        setNotice({
          tone: "error",
          text:
            err.code === err.PERMISSION_DENIED
              ? "Location access is blocked. Allow it in your browser's site settings, or search for your address."
              : err.code === err.TIMEOUT
                ? "Finding your location took too long. Try again outdoors or search for your address."
                : "We couldn't get your location. Search for your address instead.",
        });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  };

  // ---------------------------------------------------------------- save

  const save = async () => {
    if (!hasPin) {
      setNotice({ tone: "error", text: "Place the pin on your workshop first — search, use your location, or tap the map." });
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiRequest<{ location: LocationForm }>("/api/v1/mechanic/location", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (!res.success) throw new Error(res.error.message);
      const next = { ...form, ...res.data.location };
      setForm(next);
      setSaved(next);
      setNotice(null);
      toast.success(wasVisible ? "Location updated" : "You're now on the experts map");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your location");
    } finally {
      setIsSaving(false);
    }
  };

  const update = (patch: Partial<LocationForm>) => setForm((f) => ({ ...f, ...patch }));
  // The map is only positioned once; after that it follows panTo() so it never fights the user's zoom.
  const initialView = useMemo(
    () => (saved.lat != null && saved.lng != null ? { center: { lat: saved.lat, lng: saved.lng }, zoom: 15 } : { center: NIGERIA_CENTER, zoom: 6 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading]
  );
  const pinIcon = useMemo(
    () =>
      isLoaded
        ? { url: PIN_SVG, scaledSize: new google.maps.Size(40, 52), anchor: new google.maps.Point(20, 51) }
        : undefined,
    [isLoaded]
  );

  return (
    <DashboardLayout navItems={MECHANIC_NAV} role="mechanic" title="Expert Portal">
      <div className="space-y-8 relative pb-28">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-white mb-2">Service Location</h1>
            <p className="text-subtle text-base md:text-lg">Put your workshop on the map so nearby drivers can find you.</p>
          </div>
          {!isLoading && (
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border",
                wasVisible ? "border-accent/30 bg-accent/10 text-accent" : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", wasVisible ? "bg-accent animate-pulse" : "bg-amber-400")} />
              {wasVisible ? "Visible on the experts map" : "Not on the map yet"}
            </motion.span>
          )}
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* ------------------------------------------------ Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="xl:col-span-3 relative rounded-2xl overflow-hidden border border-white/5 bg-[#0c0d0d] h-[420px] xl:h-[640px]"
            >
              {loadError ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
                  <p className="text-white">The map couldn&apos;t load.</p>
                  <p className="text-subtle text-sm mt-1">You can still type your address and save.</p>
                </div>
              ) : !isLoaded ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : (
                <GoogleMap
                  mapContainerClassName="w-full h-full"
                  center={initialView.center}
                  zoom={initialView.zoom}
                  onLoad={(m) => {
                    mapRef.current = m;
                  }}
                  onClick={(e) => e.latLng && setPin(e.latLng.lat(), e.latLng.lng())}
                  options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    clickableIcons: false,
                    gestureHandling: "greedy",
                  }}
                >
                  {hasPin && (
                    <>
                      <MarkerF
                        position={{ lat: form.lat!, lng: form.lng! }}
                        draggable
                        icon={pinIcon}
                        animation={google.maps.Animation.DROP}
                        onDragEnd={(e) => e.latLng && setPin(e.latLng.lat(), e.latLng.lng())}
                      />
                      {form.serviceRadiusKm > 0 && (
                        <CircleF
                          center={{ lat: form.lat!, lng: form.lng! }}
                          radius={form.serviceRadiusKm * 1000}
                          options={{
                            fillColor: "#A3E635",
                            fillOpacity: 0.07,
                            strokeColor: "#A3E635",
                            strokeOpacity: 0.4,
                            strokeWeight: 1,
                            clickable: false,
                          }}
                        />
                      )}
                    </>
                  )}
                </GoogleMap>
              )}

              {/* Hint chip */}
              {isLoaded && !loadError && (
                <motion.div
                  key={hasPin ? "drag" : "tap"}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-4 right-4 sm:right-auto flex items-center gap-3 bg-black/70 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 pointer-events-none"
                >
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm text-white/80">
                    {hasPin ? "Drag the pin onto your workshop entrance" : "Tap the map where your workshop is"}
                  </p>
                  {lookingUp && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />}
                </motion.div>
              )}

              {isLoaded && !loadError && (
                <motion.button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  whileTap={{ scale: 0.94 }}
                  className="absolute bottom-5 right-5 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-black text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(163,230,53,0.35)] disabled:opacity-70"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  {locating ? "Locating…" : "Use my location"}
                </motion.button>
              )}
            </motion.div>

            {/* ------------------------------------------------ Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
              className="xl:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6"
            >
              {isLoaded && !loadError && <AddressSearch onPick={applyPlace} geocoder={geocoder} />}

              <AnimatePresence>
                {notice && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "text-sm rounded-xl px-4 py-3 border overflow-hidden",
                      notice.tone === "error"
                        ? "text-red-300 bg-red-500/10 border-red-500/20"
                        : "text-white/70 bg-white/[0.03] border-white/10"
                    )}
                  >
                    {notice.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">Address</h3>
                  <AnimatePresence>
                    {addressEdited && isLoaded && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={pinFromAddress}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent hover:text-white"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Move pin here
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <Field label="Street address">
                  <input
                    className={inputCls}
                    value={form.address}
                    onChange={(e) => {
                      update({ address: e.target.value });
                      setAddressEdited(true);
                    }}
                    placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <input
                      className={inputCls}
                      value={form.city}
                      onChange={(e) => {
                        update({ city: e.target.value });
                        setAddressEdited(true);
                      }}
                      placeholder="e.g. Lagos"
                    />
                  </Field>
                  <Field label="State">
                    <input
                      className={inputCls}
                      value={form.state}
                      onChange={(e) => {
                        update({ state: e.target.value });
                        setAddressEdited(true);
                      }}
                      placeholder="e.g. Lagos State"
                    />
                  </Field>
                </div>
                <Field label="Country">
                  <input className={inputCls} value={form.country} onChange={(e) => update({ country: e.target.value })} />
                </Field>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 pt-4">How far will you travel?</h3>
                <div className="flex flex-wrap gap-2">
                  {RADII.map((r) => {
                    const active = form.serviceRadiusKm === r.km;
                    return (
                      <button
                        key={r.km}
                        type="button"
                        onClick={() => update({ serviceRadiusKm: r.km })}
                        className={cn(
                          "relative px-4 py-2 rounded-full text-sm border transition-colors",
                          active ? "text-black border-transparent" : "text-white/60 border-white/10 hover:text-white"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="radius-chip"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-accent"
                          />
                        )}
                        <span className="relative">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40">
                  {form.serviceRadiusKm === 0
                    ? "Customers anywhere will see you as available to come to them."
                    : `Customers within ${form.serviceRadiusKm} km see "Covers your area" on your listing.`}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 pt-4">What customers see</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: "exact", icon: Eye, title: "Exact location", body: "Pin and street address" },
                      { id: "approximate", icon: EyeOff, title: "Approximate area", body: "Within about 1 km, no street" },
                    ] as const
                  ).map((o) => {
                    const active = form.locationPrivacy === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => update({ locationPrivacy: o.id })}
                        aria-pressed={active}
                        className={cn(
                          "text-left p-4 rounded-xl border transition-colors",
                          active ? "border-accent/60 bg-accent/10" : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <o.icon className={cn("w-4 h-4 mb-2", active ? "text-accent" : "text-white/50")} />
                        <span className="block text-sm text-white">{o.title}</span>
                        <span className="block text-xs text-white/40 mt-0.5">{o.body}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40">
                  Working from home? Approximate keeps your street private — customers message you for directions.
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-white/40 hover:text-white"
                >
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAdvanced && "rotate-180")} />
                  Advanced: coordinates
                </button>
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        {(["lat", "lng"] as const).map((k) => (
                          <Field key={k} label={k === "lat" ? "Latitude" : "Longitude"}>
                            <input
                              type="number"
                              step="0.000001"
                              className={cn(inputCls, "text-white/70")}
                              value={form[k] ?? ""}
                              onChange={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value);
                                update({ [k]: v } as Partial<LocationForm>);
                              }}
                              onBlur={() => hasPin && panTo(form.lat!, form.lng!)}
                            />
                          </Field>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}

        {/* Sticky save bar */}
        <AnimatePresence>
          {dirty && !isLoading && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+150px)] z-40 flex items-center gap-4 pl-6 pr-2 py-2 rounded-full bg-[#0c0d0d]/95 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <span className="text-sm text-white/70 whitespace-nowrap">Unsaved changes</span>
              <button
                type="button"
                onClick={() => {
                  setForm(saved);
                  setNotice(null);
                  if (saved.lat != null && saved.lng != null) panTo(saved.lat, saved.lng);
                }}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-white/60 hover:text-white"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-black text-sm font-bold disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isSaving ? "Saving…" : "Save location"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}

/**
 * Address search: Google Places (New) autocomplete, falling back to the Geocoding API
 * when the Places API isn't enabled on the key.
 */
function AddressSearch({ onPick, geocoder }: { onPick: (p: GeoPlace) => void; geocoder: () => google.maps.Geocoder }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const mode = useRef<"places" | "geocoder">("places");
  const token = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setItems([]);
      return;
    }
    const id = ++seq.current;
    const timer = window.setTimeout(
      async () => {
        setBusy(true);
        try {
          const next = await suggest(q);
          if (id === seq.current) {
            setItems(next);
            setActive(0);
            setOpen(true);
          }
        } finally {
          if (id === seq.current) setBusy(false);
        }
      },
      // Geocoding is billed per call, so wait longer between keystrokes.
      mode.current === "places" ? 250 : 600
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function suggest(input: string): Promise<Suggestion[]> {
    if (mode.current === "places") {
      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken } = (await google.maps.importLibrary(
          "places"
        )) as google.maps.PlacesLibrary;
        token.current ??= new AutocompleteSessionToken();
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: token.current,
          region: "ng",
        });
        return suggestions.flatMap((s) => {
          const p = s.placePrediction;
          if (!p) return [];
          const label = p.text.toString();
          return [
            {
              id: p.placeId,
              label,
              resolve: async () => {
                const place = p.toPlace();
                await place.fetchFields({ fields: ["location", "addressComponents", "formattedAddress"] });
                token.current = null; // a session ends once a place is picked
                if (!place.location) return null;
                return placeFromComponents(
                  (place.addressComponents ?? []).map((c) => ({ name: c.longText ?? "", types: c.types })),
                  place.formattedAddress ?? label,
                  place.location.lat(),
                  place.location.lng()
                );
              },
            },
          ];
        });
      } catch {
        mode.current = "geocoder";
      }
    }
    try {
      const { results } = await geocoder().geocode({ address: input, region: "ng" });
      return results.slice(0, 5).map((r) => ({
        id: r.place_id,
        label: r.formatted_address,
        resolve: async () =>
          placeFromComponents(
            r.address_components.map((c) => ({ name: c.long_name, types: c.types })),
            r.formatted_address,
            r.geometry.location.lat(),
            r.geometry.location.lng()
          ),
      }));
    } catch {
      return [];
    }
  }

  const pick = async (s: Suggestion) => {
    setOpen(false);
    setQuery(s.label);
    setBusy(true);
    try {
      const place = await s.resolve();
      if (place) onPick(place);
      else toast.error("That place has no map position — try another result");
    } catch {
      toast.error("Couldn't load that place");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (a + 1) % items.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (a - 1 + items.length) % items.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(items[active]);
          } else if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search your workshop or street"
        className={cn(inputCls, "pl-11 pr-10 py-3.5 bg-black/40")}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {busy && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-accent" />}
      <AnimatePresence>
        {open && items.length > 0 && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-30 left-0 right-0 mt-2 rounded-xl border border-white/10 bg-[#0c0d0d]/95 backdrop-blur-xl shadow-2xl py-1.5 overflow-hidden"
          >
            {items.map((s, i) => (
              <li
                key={s.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(s)}
                className={cn(
                  "flex items-start gap-3 px-4 py-2.5 text-sm cursor-pointer",
                  i === active ? "bg-white/[0.06] text-white" : "text-white/70"
                )}
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <span className="line-clamp-2">{s.label}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
