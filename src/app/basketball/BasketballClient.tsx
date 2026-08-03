"use client";

import dynamic from "next/dynamic";

const ShotTracker = dynamic(() => import("@/components/basketball/ShotTracker"), {
  ssr: false,
});

export default function BasketballClient() {
  return <ShotTracker />;
}
