import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "auth" | "sidebar" | "mark";
  className?: string;
};

const LOGO_SRC = "/CiisConnectlogo.png";

export function BrandLogo({ variant = "sidebar", className }: BrandLogoProps) {
  if (variant === "auth") {
    return (
      <div className={cn("flex flex-col items-center text-center", className)}>
        <img
          src={LOGO_SRC}
          alt="CIISConnect"
          className="h-auto w-full max-w-[204px] object-contain"
          width={2164}
          height={727}
          draggable={false}
        />
       
      </div>
    );
  }

  if (variant === "mark") {
    return (
      <img
        src={LOGO_SRC}
        alt="CIISConnect"
        className={cn(
          "h-8 w-auto max-w-28 shrink-0 object-contain",
          className,
        )}
        width={2164}
        height={727}
        draggable={false}
      />
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt="CIISConnect"
      className={cn("h-8 w-auto max-w-[168px] shrink-0 object-contain", className)}
      width={2164}
      height={727}
      draggable={false}
    />
  );
}
