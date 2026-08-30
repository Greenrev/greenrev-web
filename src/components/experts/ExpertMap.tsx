"use client";

import React, { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, OverlayView } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Wrench, Phone, Mail } from "lucide-react";
import Image from "next/image";
import BookingModal from "./BookingModal";

interface Expert {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  specialization: string[];
  phone: string;
  email: string;
  image: string | null;
}

interface ExpertMapProps {
  experts: Expert[];
  selectedExpert?: Expert;
  onSelectExpert: (expert: Expert) => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const darkMapStyle = [
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

export default function ExpertMap({ experts, selectedExpert, onSelectExpert }: ExpertMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const center = useMemo(() => {
    if (selectedExpert) {
      return { lat: selectedExpert.lat, lng: selectedExpert.lng };
    }
    return { lat: 9.0820, lng: 8.6753 }; // Nigeria center
  }, [selectedExpert]);

  if (loadError) return (
    <div className="w-full h-full bg-[#050505] flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <MapPin className="w-8 h-8 text-red-500/50" />
      </div>
      <h3 className="text-xl font-display text-white mb-2">Map Failed to Load</h3>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">
        We encountered a synchronization error with the mapping grid. Please verify your satellite uplink (API Key).
      </p>
      <div className="mt-8 text-[10px] text-white/20 font-mono uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg">
        Error: {loadError.message || "InvalidKeyMapError"}
      </div>
    </div>
  );

  if (!isLoaded) return (
    <div className="w-full h-full bg-[#050505] flex items-center justify-center">
      <div className="text-accent text-xs uppercase tracking-[0.3em] font-bold animate-pulse">
        Loading Map...
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full bg-black">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={selectedExpert ? 12 : 6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {experts.map((expert) => (
          <OverlayView
            key={expert.id}
            position={{ lat: expert.lat, lng: expert.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div 
              onClick={() => onSelectExpert(expert)}
              className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              {/* The "Bipping Bubble" Pulse Effect */}
              <motion.div
                animate={{
                  scale: [1, 2.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-accent rounded-full -m-4 blur-sm"
              />
              
              {/* Marker Icon */}
              <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                selectedExpert?.id === expert.id 
                  ? "bg-accent border-accent text-black scale-110 shadow-[0_0_20px_rgba(163,230,53,0.5)]" 
                  : "bg-black/80 border-accent/40 text-accent hover:border-accent group-hover:scale-105"
              }`}>
                <Wrench className="w-5 h-5" />
              </div>

              {/* Label on Hover/Selection */}
              <AnimatePresence>
                {(selectedExpert?.id === expert.id) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -50, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl whitespace-nowrap z-50 pointer-events-none shadow-2xl"
                  >
                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest">{expert.name}</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black border-r border-b border-white/10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </OverlayView>
        ))}
      </GoogleMap>

      {/* Info Card Overlay */}
      <AnimatePresence>
        {selectedExpert && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute bottom-4 right-4 md:bottom-12 md:right-12 w-[calc(100vw-2rem)] md:w-[400px] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-40"
          >
            <div className="relative h-48">
              {selectedExpert.image ? (
                <Image
                  src={selectedExpert.image}
                  alt={selectedExpert.name}
                  fill
                  className="object-cover opacity-60"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 to-yellow-500/20 flex items-end" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8">
                <div className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Certified Center</div>
                <h4 className="text-3xl font-display text-white">{selectedExpert.name}</h4>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-sm text-white/60 font-light leading-relaxed pt-1">
                        {selectedExpert.address}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-3 h-3 text-accent" />
                        <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Contact</span>
                    </div>
                    <div className="text-xs text-white/80">{selectedExpert.phone}</div>
                 </div>
                 <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-3 h-3 text-accent" />
                        <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Inquiry</span>
                    </div>
                    <div className="text-xs text-white/80 truncate">{selectedExpert.email}</div>
                 </div>
              </div>

              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-accent transition-all"
              >
                Book Specialized Service
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedExpert && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          mechanicId={selectedExpert.id}
          mechanicName={selectedExpert.name}
        />
      )}

      {/* Custom Map Controls */}
      <div className="absolute top-20 right-4 md:top-12 md:right-12 flex flex-col gap-4">
         <div className="p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Global Network Active</span>
            </div>
         </div>
         
         <div className="flex flex-col gap-2">
            <button 
                onClick={() => map?.setZoom((map.getZoom() || 0) + 1)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all font-bold text-xl"
            >
                +
            </button>
            <button 
                onClick={() => map?.setZoom((map.getZoom() || 0) - 1)}
                className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all font-bold text-xl"
            >
                −
            </button>
         </div>
      </div>
    </div>
  );
}
