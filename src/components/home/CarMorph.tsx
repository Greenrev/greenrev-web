"use client";

import { useRef, useLayoutEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const showcaseImages = [
  '/showcase_front.jpg',
  '/showcase_side.jpg',
  '/showcase_rear.jpg',
];

const specTags = [
  { label: 'Aerodynamics', value: 'Optimized Flow' },
  { label: 'Braking', value: 'Carbon-ceramic' },
  { label: 'Wheels', value: 'Forged alloys' },
];

const ShowcaseSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image rotation based on scroll progress
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    
    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            // Map scroll progress to image index
            const progress = self.progress;
            const index = Math.min(
              Math.floor(progress * showcaseImages.length),
              showcaseImages.length - 1
            );
            setCurrentImageIndex(index);
          },
        },
      });

      // ENTRANCE (0%-30%)
      // Background
      scrollTl.fromTo(
        bgRef.current,
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, ease: 'none' },
        0
      );

      // Label
      scrollTl.fromTo(
        labelRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      // Headline from left
      scrollTl.fromTo(
        headlineRef.current,
        { x: isMobile ? '-100vw' : '-55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );

      // Body + CTA from bottom
      scrollTl.fromTo(
        bodyRef.current,
        { y: '18vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.05
      );

      scrollTl.fromTo(
        ctaRef.current,
        { y: '18vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.08
      );

      // Spec tags from right (staggered)
      const tags = tagsRef.current?.querySelectorAll('.spec-tag');
      if (tags) {
        tags.forEach((tag, i) => {
          scrollTl.fromTo(
            tag,
            { x: isMobile ? 0 : '40vw', y: isMobile ? '20vh' : 0, opacity: 0 },
            { x: 0, y: 0, opacity: 1, ease: 'none' },
            0.08 + i * 0.03
          );
        });
      }

      // SETTLE (30%-70%): Hold positions

      // EXIT (70%-100%)
      scrollTl.fromTo(
        headlineRef.current,
        { x: 0, opacity: 1 },
        { x: isMobile ? '-100vw' : '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bodyRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      if (tags) {
        tags.forEach((tag, i) => {
          scrollTl.fromTo(
            tag,
            { x: 0, y: 0, opacity: 1 },
            { x: isMobile ? 0 : '18vw', y: isMobile ? '20vh' : 0, opacity: 0, ease: 'power2.in' },
            0.7 + i * 0.02
          );
        });
      }

      scrollTl.fromTo(
        labelRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );

      scrollTl.fromTo(
        bgRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.05, opacity: 0.35, ease: 'power2.in' },
        0.7
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-background"
    >
      {/* Background Images */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform" style={{ opacity: 0 }}>
        {showcaseImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            fill
            alt={`Car view ${index + 1}`}
            className={`object-cover transition-opacity duration-500 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="vignette" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/50" />
      </div>

      {/* Top Label */}
      <span
        ref={labelRef}
        className="absolute top-[6vh] left-1/2 -translate-x-1/2 text-sm text-accent z-20"
        style={{ opacity: 0 }}
      >
        ROTATING VIEW
      </span>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-[7vw]">
        {/* Headline - Left */}
        <div ref={headlineRef} className="max-w-[90vw] md:max-w-[40vw] mb-6" style={{ opacity: 0 }}>
          <h2 className="font-display font-medium text-[clamp(34px,3.6vw,56px)] text-white">
            Quality in
            <br />
            Every Angle.
          </h2>
        </div>

        {/* Body - Left */}
        <div ref={bodyRef} className="max-w-[90vw] md:max-w-[34vw] mb-8" style={{ opacity: 0 }}>
          <p className="text-base text-subtle leading-relaxed">
            From grille to diffuser, every line is intentional. We photograph and inspect
            so you know exactly what you&apos;re acquiring.
          </p>
        </div>

        {/* CTA - Left */}
        <Link href="/shop" ref={ctaRef} className="px-8 py-3 w-fit bg-accent text-black font-semibold uppercase tracking-wider text-sm transition-transform hover:scale-105" style={{ opacity: 0 }}>
          View Full Gallery
        </Link>

        {/* Spec Tags - Right */}
        <div
          ref={tagsRef}
          className="absolute left-[7vw] md:left-auto right-[7vw] bottom-[15vh] md:bottom-auto md:top-[22vh] w-[86vw] md:w-[22vw] space-y-0 space-x-4 md:space-x-0 md:space-y-4 flex flex-row md:flex-col overflow-x-auto custom-scrollbar pb-4 md:pb-0"
        >
          {specTags.map((tag, index) => (
            <div
              key={tag.label}
              className="spec-tag bg-white/5 backdrop-blur-md border border-white/10 p-4 flex flex-col md:flex-row justify-between items-start md:items-center transition-transform hover:border-accent flex-shrink-0 w-[60vw] md:w-full gap-2 md:gap-0"
              style={{
                opacity: 0,
                animationDelay: `${index * 0.5}s`,
              }}
            >
              <span className="text-xs tracking-widest uppercase text-subtle">{tag.label}</span>
              <span className="font-display font-semibold text-sm text-accent">
                {tag.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {showcaseImages.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-1 rounded-full transition-all duration-300 ${
              index === currentImageIndex ? 'bg-accent' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default ShowcaseSection;