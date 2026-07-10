import Image from "next/image";

export function FloatingWhatsapp() {
  return (
    <a
      href="https://wa.me/5519998383234"
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com Carla Davanso pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 block transition duration-300 hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25D366]/45 sm:bottom-7 sm:right-7"
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={80}
        height={80}
        className="size-18 rounded-full drop-shadow-2xl sm:size-20"
      />
    </a>
  );
}
