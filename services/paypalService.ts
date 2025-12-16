
import { SavedItem } from '../types';

// Pricing for each tier (in USD)
export const TIER_PRICES = {
  pro: "5.00",
  agency: "99.00",
} as const;

// Helper to safely access env vars without crashing at module load time
const getEnvConfig = () => {
    // Reverting to the previous known valid credentials and ensuring no trailing spaces
    const DEFAULT_CONFIG = {
        mode: "sandbox",
        clientId: "AXF6EK8pbdt8cv7YrPxy6qzhvo5CW-ue07t56LQHHZhkamllUSRLRqPENg7DqfYZvK8mm9tXP5wWR-eZ",
        clientSecret: "EH-s6iH37myVMmk7VMkSkQ8Td1ztogz0G1XLzDoY7aOOgQN3V7vTXsOmwAisz8C4OdAKk4mE4JBfIQUx"
    };

    try {
        if (typeof process !== 'undefined' && process.env) {
            return {
                mode: (process.env.PAYPAL_MODE || DEFAULT_CONFIG.mode).trim(),
                clientId: (process.env.PAYPAL_CLIENT_ID || DEFAULT_CONFIG.clientId).trim(),
                clientSecret: (process.env.PAYPAL_CLIENT_SECRET || DEFAULT_CONFIG.clientSecret).trim()
            };
        }
    } catch (e) {
        // Ignore error
    }
    return DEFAULT_CONFIG;
};

const getBaseUrl = () => {
    const config = getEnvConfig();
    return config.mode === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";
};

/**
 * Get PayPal access token for API authentication
 */
async function getAccessToken(): Promise<string> {
  const config = getEnvConfig();
  
  if (!config.clientId || !config.clientSecret) {
    throw new Error(
      "PayPal credentials not configured."
    );
  }

  // Use btoa for browser-side base64 encoding (Buffer is Node-only)
  const auth = btoa(`${config.clientId}:${config.clientSecret}`);

  const response = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("PayPal Auth Failed:", err);
      throw new Error(`Failed to authenticate with PayPal: ${err.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal order for subscription upgrade
 */
export async function createPayPalOrder(tier: "pro" | "agency", userId: string) {
  const accessToken = await getAccessToken();
  const amount = TIER_PRICES[tier];
  
  // Construct return URLs based on current location
  const baseUrl = window.location.href.split('?')[0];
  const returnUrl = `${baseUrl}?payment_success=true&tier=${tier}`;
  const cancelUrl = `${baseUrl}?payment_cancel=true`;

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount,
        },
        description: `SBL System Monetizer™ - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        custom_id: userId,
      },
    ],
    application_context: {
      brand_name: "SBL System Monetizer™",
      landing_page: "BILLING",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const response = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to create PayPal order: ${err.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Capture a PayPal order after user approval
 */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({})
    }
  );

  if (!response.ok) {
       const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to capture PayPal order: ${err.message || response.statusText}`);
  }

  return response.json();
}
