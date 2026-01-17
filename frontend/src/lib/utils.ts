import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatPercentageForInput(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toString();
}

export function formatDateForInput(isoString: string): string {
  return isoString.split('T')[0];
}

export function formatDateForApi(dateString: string): string {
  return new Date(dateString).toISOString();
}
