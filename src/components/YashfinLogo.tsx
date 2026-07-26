import React from 'react';

interface YashfinLogoProps {
  className?: string;
  size?: number | string;
}

export default function YashfinLogo({ className = '', size = '100%' }: YashfinLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={className}
    >
      {/* Crisp White background circle */}
      <circle cx="250" cy="250" r="242" fill="#ffffff" />

      {/* Text Path Definitions */}
      <defs>
        {/* Top Text Path: Left-to-Right curve along the top inside area */}
        <path id="topTextPath" d="M 65,250 A 185,185 0 0,1 435,250" fill="none" />
        {/* Bottom Text Path: Right-to-Left curve along the bottom inside area to keep text upright */}
        <path id="bottomTextPath" d="M 435,250 A 185,185 0 0,0 65,250" fill="none" />
      </defs>

      {/* Decorative separating dots on the left and right */}
      <circle cx="58" cy="250" r="5" fill="#c08e1a" />
      <circle cx="442" cy="250" r="5" fill="#c08e1a" />

      {/* Arched Top Text (Gold) */}
      <text
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="17"
        fontWeight="700"
        fill="#c08e1a"
      >
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          When I am ill, it is ALLAH who cures me.
        </textPath>
      </text>

      {/* Arched Bottom Text (Dark Green) */}
      <text
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontSize="30"
        fontWeight="900"
        fill="#00613a"
        letterSpacing="2"
      >
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          YASHFIN HEALTH POINT
        </textPath>
      </text>

      {/* Central 8-Pointed Star (Gold) */}
      <polygon
        points="250,60 255,75 270,68 262,82 277,87 262,92 270,106 255,99 250,114 245,99 230,106 238,92 223,87 238,82 230,68 245,75"
        fill="#c08e1a"
      />

      {/* Central Figure - Head */}
      <circle cx="250" cy="155" r="23" fill="#00613a" />

      {/* Central Figure - Arms & Upper Chest */}
      <path
        d="M 250,195 
           C 225,195 190,165 170,138
           C 190,162 220,188 250,202
           C 280,188 310,162 330,138
           C 310,165 275,195 250,195 Z"
        fill="#00613a"
      />

      {/* Central Figure - Lower Body & Tapering Tail (curves left) */}
      <path
        d="M 230,200
           C 242,235 250,265 250,300
           C 250,340 222,375 192,392
           C 222,372 250,325 258,285
           C 264,248 268,220 273,200 Z"
        fill="#00613a"
      />

      {/* Left Framing Crescent (Dark Green) */}
      <path
        d="M 183,110
           C 145,142 118,205 130,258
           C 142,310 190,342 245,302
           C 200,325 160,290 154,245
           C 148,200 165,145 183,110 Z"
        fill="#00613a"
      />

      {/* Right Framing Crescent (Dark Green) */}
      <path
        d="M 317,110
           C 355,142 382,205 370,258
           C 358,310 310,342 255,302
           C 300,325 340,290 346,245
           C 352,200 335,145 317,110 Z"
        fill="#00613a"
      />

      {/* Medical Cross centered around (250, 260) */}
      <g>
        {/* Crisp White outline contour of the cross */}
        <path
          d="M 229,215 H 271 V 239 H 295 V 281 H 271 V 305 H 229 V 281 H 205 V 239 H 229 Z"
          fill="#ffffff"
        />
        {/* Inner solid Green cross */}
        <path
          d="M 233,219 H 267 V 243 H 291 V 277 H 267 V 301 H 233 V 277 H 209 V 243 H 233 Z"
          fill="#00613a"
        />
      </g>
    </svg>
  );
}
