import { cn } from "@/lib/utils";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/smmlogo.png"
        alt="Sangma Megha Mart Logo"
        width={140}
        height={30}
        priority
      />
    </div>
  );
};

export default Logo;
