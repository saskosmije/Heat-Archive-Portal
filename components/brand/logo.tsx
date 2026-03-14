interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  return (
    <span
      className={`
        font-bold tracking-[0.2em] uppercase text-foreground
        ${sizes[size]}
        ${className}
      `}
    >
      <span className="text-gold">Heat</span>{" "}
      <span>Archive</span>
    </span>
  );
}
