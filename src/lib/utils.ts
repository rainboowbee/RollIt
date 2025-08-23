import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBalance(balance: number): string {
  return balance.toLocaleString();
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function getDisplayName(user: {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  if (user.username) {
    return `@${user.username}`;
  }
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName || lastName || 'Unknown User';
}
