"use client";

interface Props {
  /** Visual height for both seals — matched for aesthetic balance */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Side-by-side pair (idle/share) or split corners (start screen) */
  layout?: "pair" | "split";
}

const SIZE = {
  sm: "h-12 sm:h-14",
  md: "h-16 sm:h-[4.5rem]",
  lg: "h-[4.75rem] sm:h-24",
} as const;

function LogoImg({
  src,
  alt,
  heightClass,
}: {
  src: string;
  alt: string;
  heightClass: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${heightClass} w-auto object-contain drop-shadow-sm select-none`}
      draggable={false}
    />
  );
}

export default function BrandLogos({
  size = "md",
  className = "",
  layout = "pair",
}: Props) {
  const h = SIZE[size];

  if (layout === "split") {
    return (
      <div
        className={`pointer-events-none fixed top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-30 flex items-start justify-between ${className}`}
        aria-label="ACES and FITMA"
      >
        <LogoImg
          src="/logos/aces.png"
          alt="ACES — Alliance of Computing Education Students"
          heightClass={h}
        />
        <LogoImg
          src="/logos/fitma.png"
          alt="FEU-R FITMA"
          heightClass={h}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-4 sm:gap-6 ${className}`}
      aria-label="ACES and FITMA"
    >
      <LogoImg
        src="/logos/aces.png"
        alt="ACES — Alliance of Computing Education Students"
        heightClass={h}
      />
      <span
        className="h-8 sm:h-10 w-px bg-gradient-to-b from-transparent via-feu-gold/55 to-transparent"
        aria-hidden
      />
      <LogoImg src="/logos/fitma.png" alt="FEU-R FITMA" heightClass={h} />
    </div>
  );
}
