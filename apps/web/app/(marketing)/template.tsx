"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";

// The first paint must not be hidden (LCP / no-JS), so only client-side navigations animate.
let navigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const animate = navigated;
  useEffect(() => {
    navigated = true;
  }, []);
  return (
    <motion.div initial={animate ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
