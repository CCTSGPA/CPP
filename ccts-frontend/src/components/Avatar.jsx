import React from "react";

function pickColor(key) {
  if (!key) return "#6A0DAD";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}deg 65% 50%)`;
}

export default function Avatar({ name, size = 36, className = "" }) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  const bg = pickColor(name || initial);
  return (
    <div
      className={"flex items-center justify-center rounded-full text-white font-semibold " + className}
      style={{ width: size, height: size, background: bg }}
      title={name}
      aria-hidden={true}
    >
      <span style={{ fontSize: Math.round(size / 2.5) }}>{initial}</span>
    </div>
  );
}
