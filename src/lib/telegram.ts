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
    if (urlParams.has('tgWebAppData') || urlParams.has('tgWebAppStartParam') || urlParams.has('tgWebAppThemeParams')) {
      return true;
    }
  }
  
  // Method 5: Check for Telegram-specific domains
  if (window.location.href.includes('t.me') || 
      window.location.href.includes('telegram.org') || 
      window.location.href.includes('web.telegram.org')) {
    return true;
  }
  
  // Method 6: Check for global Telegram variables
  if ((window as unknown as Record<string, unknown>).TelegramWebApp || (window as unknown as Record<string, unknown>).tgWebApp) {
    return true;
  }
  
  // Method 7: Check for Telegram-specific environment variables
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__TELEGRAM_WEB_APP__) {
    return true;
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

export function forceInitTelegramWebApp(): void {
  if (typeof window === 'undefined') return;
  
  // Try to initialize Telegram WebApp if it exists but might not be ready
  if (window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.ready();
      console.log('Telegram WebApp force initialized');
    } catch (error) {
      console.warn('Error force initializing WebApp:', error);
    }
  }
  
  // Check for alternative Telegram WebApp implementations
  if ((window as unknown as Record<string, unknown>).TelegramWebApp) {
    try {
      ((window as unknown as Record<string, unknown>).TelegramWebApp as { ready: () => void }).ready();
      console.log('Alternative Telegram WebApp initialized');
    } catch (error) {
      console.warn('Error initializing alternative WebApp:', error);
    }
  }
}

export function waitForTelegramWebApp(maxWaitTime = 10000): Promise<TelegramWebApp | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    
    // Check immediately
    if (window.Telegram?.WebApp) {
      resolve(window.Telegram.WebApp);
      return;
    }
    
    // Wait and check periodically
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.Telegram?.WebApp) {
        clearInterval(checkInterval);
        resolve(window.Telegram.WebApp);
        return;
      }
      
      // Timeout
      if (Date.now() - startTime > maxWaitTime) {
        clearInterval(checkInterval);
        resolve(null);
        return;
      }
    }, 100);
  });
}
