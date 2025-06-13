import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to shorten addresses
export const shortenAddress = (address: string | undefined | null, chars = 4): string => {
  if (!address) return ""; // Return empty string if address is falsy
  if (address.length <= chars * 2 + 2) {
    return address; // Address is too short to shorten meaningfully
  }
  const prefix = address.substring(0, chars + 2); // 0x + chars
  const suffix = address.substring(address.length - chars);
  return `${prefix}...${suffix}`;
};
