import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
  };
  ready(): void;
  expand(): void;
  close(): void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(fn: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
  };
  BackButton: {
    isVisible: boolean;
    onClick(fn: () => void): void;
    show(): void;
    hide(): void;
  };
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function isTelegramWebApp(): boolean {
  // Multiple detection methods
  if (typeof window === 'undefined') return false;
  
  // Method 1: Check for Telegram.WebApp object
  if (window.Telegram?.WebApp) return true;
  
  // Method 2: Check for initData
  if (window.Telegram?.WebApp?.initData) return true;
  
  // Method 3: Check user agent
  if (navigator.userAgent.includes('TelegramWebApp')) return true;
  
  // Method 4: Check for Telegram-specific URL parameters
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tgWebAppData') || urlParams.has('tgWebAppStartParam')) {
      return true;
    }
  }
  
  return false;
}

export function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

export function validateInitData(
  initData: string,
  botToken: string
): boolean {
  try {
    const params = parseInitData(initData);
    const hash = params.hash;
    
    if (!hash) return false;
    
    // Remove hash from params
    delete params.hash;
    
    // Sort params alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating init data:', error);
    return false;
  }
}

export function extractUserFromInitData(initData: string): TelegramUser | null {
  try {
    const params = parseInitData(initData);
    
    if (!params.user) return null;
    
    return JSON.parse(params.user) as TelegramUser;
  } catch (error) {
    console.error('Error extracting user from init data:', error);
    return null;
  }
}
