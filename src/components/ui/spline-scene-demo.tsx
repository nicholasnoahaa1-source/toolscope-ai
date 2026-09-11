"use client";

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-azul-profundo relative overflow-hidden border-azul-estrutural">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />

      <div className="flex h-full">
        {/* Left content */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="font-editorial italic text-4xl md:text-5xl font-semibold text-creme-editorial">
            Interactive 3D
          </h1>
          <p className="mt-4 text-azul-claro max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive
            experiences that capture attention and enhance your design.
          </p>
        </div>

        {/* Right content */}
        <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
