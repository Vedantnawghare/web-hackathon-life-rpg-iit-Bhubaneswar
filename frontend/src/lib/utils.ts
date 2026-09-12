import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGold(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export function formatXP(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}
