// components/FlowbiteInitializer.tsx
"use client";

import { useEffect } from "react";
import { initFlowbite } from "flowbite";

export default function FlowbiteInitializer() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return null;
}
