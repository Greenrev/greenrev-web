"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        checked ? "bg-accent" : "bg-white/10"
      }`}
      onClick={() => onChange(!checked)}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        animate={{ x: checked ? 24 : 0 }}
      />
    </div>
  );
}
