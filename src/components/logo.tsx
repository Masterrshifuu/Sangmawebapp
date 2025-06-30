import { cn } from "@/lib/utils";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.png"
        alt="Sangma Megha Mart Logo"
        width={60}
        height={60}
        priority
      />
      <span className="font-roboto text-lg font-bold">
        Sangma Megha Mart
      </span>
    </div>
  );
};

export default Logo;
