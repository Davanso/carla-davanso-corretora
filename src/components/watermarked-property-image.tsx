import Image from "next/image";

type WatermarkedPropertyImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  watermark?: "white" | "brown";
};

export function WatermarkedPropertyImage({
  alt,
  className,
  priority,
  sizes,
  src,
  watermark = "white",
}: WatermarkedPropertyImageProps) {
  const watermarkSrc = watermark === "brown" ? "/brand/watermark-brown.png" : "/brand/watermark-white.png";

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className ?? "object-cover"}
        sizes={sizes}
      />
      <Image
        src={watermarkSrc}
        alt=""
        width={280}
        height={126}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-3 w-[min(34%,17rem)] opacity-80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
      />
    </>
  );
}
