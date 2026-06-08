import React from "react";
import { MeshGradient } from "@paper-design/shaders-react";

const ShaderBackground = ({ speed = 0.4, opacity = 1 }) => {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      <MeshGradient
        className="w-full h-full"
        colors={["#0a0f1e", "#12102e", "#ea580c", "#d97706", "#fbbf24"]}
        speed={speed}
        backgroundColor="#0a0f1e"
      />
    </div>
  );
};

export default ShaderBackground;
