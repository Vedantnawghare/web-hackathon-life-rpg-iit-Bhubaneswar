"use client";

import React from "react";
import { Dumbbell, Brain, Compass, Heart, Palette } from "lucide-react";

interface StatRadarProps {
  strength: number;
  intellect: number;
  discipline: number;
  vitality: number;
  creativity: number;
  maxStat?: number;
}

export function StatRadar({
  strength,
  intellect,
  discipline,
  vitality,
  creativity,
  maxStat = 100,
}: StatRadarProps) {
  const stats = [
    { name: "Strength", value: strength, icon: Dumbbell, color: "#f43f5e" }, // Top
    { name: "Intellect", value: intellect, icon: Brain, color: "#38bdf8" }, // Top Right
    { name: "Discipline", value: discipline, icon: Compass, color: "#34d399" }, // Bottom Right
    { name: "Vitality", value: vitality, icon: Heart, color: "#fbbf24" }, // Bottom Left
    { name: "Creativity", value: creativity, icon: Palette, color: "#c084fc" }, // Top Left
  ];

  const size = 260;
  const center = size / 2;
  const radius = size * 0.38;

  // Angles for 5 vertices starting from top (-PI / 2)
  const angleStep = (2 * Math.PI) / 5;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.min(1.0, Math.max(0.1, valueRatio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric polygon web points
  const getWebPolygon = (scaleRatio: number) => {
    return stats
      .map((_, i) => {
        const { x, y } = getCoordinates(i, scaleRatio);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // Data polygon points
  const dataPolygon = stats
    .map((s, i) => {
      const ratio = s.value / maxStat;
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] h-auto overflow-visible"
        role="img"
        aria-label="Character Attribute Pentagonal Radar Chart"
      >
        <title>Character Attribute Radar Chart</title>
        <desc>
          Visual representation of Strength: {strength}, Intellect: {intellect}, Discipline:{" "}
          {discipline}, Vitality: {vitality}, Creativity: {creativity}
        </desc>

        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#d97706" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.05" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Grid Webs */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio) => (
          <polygon
            key={ratio}
            points={getWebPolygon(ratio)}
            fill="none"
            stroke="#334155"
            strokeWidth={ratio === 1.0 ? "1.5" : "0.75"}
            strokeDasharray={ratio === 1.0 ? "none" : "2,2"}
            opacity={ratio === 1.0 ? 0.6 : 0.3}
          />
        ))}

        {/* Axis Lines */}
        {stats.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#334155"
              strokeWidth="0.75"
              opacity="0.5"
            />
          );
        })}

        {/* Filled Character Stat Polygon */}
        <polygon
          points={dataPolygon}
          fill="url(#radarGradient)"
          stroke="#f59e0b"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Data Points */}
        {stats.map((s, i) => {
          const ratio = s.value / maxStat;
          const { x, y } = getCoordinates(i, ratio);
          return (
            <circle
              key={s.name}
              cx={x}
              cy={y}
              r="3.5"
              fill="#fbbf24"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Vertex Labels & Values */}
        {stats.map((s, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 24;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);

          return (
            <g key={s.name} transform={`translate(${lx}, ${ly})`}>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-bold fill-slate-300 uppercase tracking-wider"
              >
                {s.name.slice(0, 3)}
              </text>
              <text
                y="11"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-mono font-bold fill-amber-400"
              >
                {s.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
