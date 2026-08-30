"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Car, Wrench, Settings, Truck, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroVideoY = useTransform(smoothProgress, [0, 0.4], ["0%", "30%"]);
  const heroTextOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const heroTextY = useTransform(smoothProgress, [0, 0.2], ["0%", "50%"]);

  return (
    <main
      ref={containerRef}
      className="relative bg-background text-white selection:bg-accent selection:text-black"
    >
      {/* 1. HERO SECTION */}
      <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center">
        {/* Background */}
        <motion.div
          style={{ y: heroVideoY }}
          className="absolute inset-0 w-full h-[120%] -top-[10%] z-0"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center filter brightness-[0.3]" />
          {/* Subtle gradient overlay to blend into the next section */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroTextOpacity, y: heroTextY }}
          className="relative z-20 text-center px-6 mt-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          >
            <span className="text-accent text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-6 block font-bold drop-shadow-md">
              One Automotive Ecosystem
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight mb-8 drop-shadow-2xl">
              GreenRev
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-subtle font-light leading-relaxed">
              A technology-driven digital automotive marketplace connecting buyers with 
              independent vehicle dealers, automotive parts vendors, mechanics and other 
              automotive service providers through one integrated platform.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
        >
          <span className="text-[9px] uppercase tracking-widest text-subtle font-bold">
            Discover
          </span>
          <div className="w-px h-16 bg-white/10 relative overflow-hidden">
            <motion.div
              animate={{ y: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-accent origin-top"
            />
          </div>
        </motion.div>
      </section>

      {/* 2. WHY GREENREV & PLATFORM SECTION */}
      <section className="relative z-20 bg-background pt-48 pb-24 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <span className="text-accent text-[10px] tracking-[0.3em] uppercase block font-bold">
                Why GreenRev?
              </span>
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
                className="text-4xl md:text-5xl font-display leading-tight"
              >
                Bringing fragmentation <br />
                <span className="text-accent italic">together.</span>
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="space-y-6 text-subtle text-lg font-light leading-relaxed max-w-lg"
              >
                <p>
                  The automotive market can be fragmented. Buyers often have to move between different platforms, 
                  dealers, vendors and service providers to find a vehicle, source parts, locate a mechanic or access other 
                  automotive services.
                </p>
                <p className="text-white font-medium">
                  GreenRev exists to bring these experiences together.
                </p>
                <p>
                  Our platform creates a digital connection between consumers and automotive businesses, making it 
                  easier to discover, compare, and connect with options from one connected platform.
                </p>
                <p className="font-bold tracking-widest uppercase text-sm mt-8 text-accent">
                  Discover. Compare. Connect.
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PillarCard
                icon={<Car />}
                title="Vehicles"
                description="Explore vehicle listings from independent dealers and sellers and discover options that suit your needs, preferences and budget."
                delay={0}
              />
              <PillarCard
                icon={<Settings />}
                title="Automotive Parts"
                description="Discover automotive parts and components from vendors through the GreenRev marketplace."
                delay={0.1}
              />
              <PillarCard
                icon={<Wrench />}
                title="Mechanics & Experts"
                description="Find and connect with mechanics and automotive service providers for maintenance, repairs and other vehicle-related needs."
                delay={0.2}
              />
              <PillarCard
                icon={<Truck />}
                title="Rentals & Mobility"
                description="Explore available vehicle rental options and connect with logistics mobility services."
                delay={0.3}
                comingSoon
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. AUDIENCE & TRUST SECTION */}
      <section className="relative z-20 bg-black py-32 px-6 border-y border-white/5 overflow-hidden">
        <div className="max-w-[1600px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-display text-white">For Buyers</h3>
            <p className="text-subtle font-light leading-relaxed">
              GreenRev is designed to make automotive discovery easier. Instead of navigating multiple disconnected channels, customers can use one platform to explore vehicles, products and services while accessing information that helps them make more informed decisions.
            </p>
            <p className="text-white font-medium">Our goal is simple: Make the automotive journey easier to navigate.</p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-display text-white">For Automotive Businesses</h3>
            <p className="text-subtle font-light leading-relaxed">
              We provide independent dealers, automotive parts vendors, mechanics and other service providers with a digital platform to showcase their businesses, reach potential customers and participate in a growing automotive ecosystem.
            </p>
            <p className="text-white font-medium">Connect your business with people looking for what you offer.</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-display text-white flex items-center gap-3">
              <ShieldCheck className="text-accent w-6 h-6" /> Built Around Trust
            </h3>
            <p className="text-subtle font-light leading-relaxed">
              Trust is essential in the automotive marketplace. GreenRev is being developed with technology and platform controls designed to support greater accountability across interactions.
            </p>
            <ul className="space-y-2 text-sm text-subtle font-light">
              <li>• Business and provider verification</li>
              <li>• Structured marketplace listings</li>
              <li>• Transaction references and tracking</li>
              <li>• Ratings and reviews</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. MISSION & VISION */}
      <section className="relative z-20 bg-background py-32 px-6">
        <div className="max-w-[1000px] mx-auto space-y-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-accent text-[10px] tracking-[0.3em] uppercase block font-bold mb-4">Our Mission</span>
            <h2 className="text-3xl md:text-5xl font-display leading-tight mb-6">
              To simplify how people discover, compare and access vehicles, automotive products and services through technology.
            </h2>
            <p className="text-subtle text-lg font-light">
              We want to reduce fragmentation within the automotive journey by bringing consumers and automotive businesses together through one connected digital platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-accent text-[10px] tracking-[0.3em] uppercase block font-bold mb-4">Our Vision</span>
            <h2 className="text-3xl md:text-5xl font-display leading-tight mb-6">
              To build Africa's connected digital automotive ecosystem.
            </h2>
            <p className="text-subtle text-lg font-light">
              Beginning in Nigeria, our ambition is to create a platform that connects consumers, automotive businesses, services and technology—and progressively expand the GreenRev ecosystem across Africa and beyond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. COMPANY DETAILS */}
      <section className="relative z-20 bg-black py-20 px-6 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto text-center space-y-6">
          <h3 className="text-xl font-display text-white">An Independent Marketplace</h3>
          <p className="text-subtle font-light max-w-3xl mx-auto text-sm leading-relaxed">
            GreenRev operates as a digital automotive marketplace and technology platform. Vehicles, automotive parts and services displayed on GreenRev may be offered by independent dealers, sellers, vendors, mechanics and other third-party service providers. Unless expressly stated otherwise, GreenRev does not own the vehicles or products advertised by independent marketplace participants.
          </p>
          <div className="pt-8">
            <p className="text-xs tracking-widest text-white/40 uppercase">
              GreenRev is operated by <strong className="text-white/80">GreenCrest Limited</strong>, a company incorporated in Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="relative z-20 bg-background py-48 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
          className="max-w-3xl mx-auto space-y-10"
        >
          <h2 className="text-5xl md:text-7xl font-display">
            Join the <span className="text-accent italic">Ecosystem</span>.
          </h2>
          <p className="text-xl text-subtle font-light">
            Whether you're looking for your next vehicle, searching for automotive parts, finding a mechanic, 
            or looking to grow your automotive business, GreenRev is being built to bring those possibilities together.
          </p>
          <div className="pt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-10 py-5 bg-accent text-black font-bold uppercase tracking-widest text-[11px] rounded-full transition-transform hover:scale-105 shadow-[0_0_40px_rgba(199,164,61,0.2)] hover:shadow-[0_0_60px_rgba(199,164,61,0.4)]"
            >
              Explore GreenRev
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[11px] rounded-full transition-all hover:bg-white/10 hover:border-white/20"
            >
              Join as a Business
            </Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </main>
  );
}

function PillarCard({
  icon,
  title,
  description,
  delay,
  comingSoon = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  comingSoon?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-500">
          {icon}
        </div>
        {comingSoon && (
          <span className="px-2 py-1 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-white/60 rounded-md">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-xl font-display text-white mb-3 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-subtle text-sm leading-relaxed font-light">{description}</p>
    </motion.div>
  );
}
