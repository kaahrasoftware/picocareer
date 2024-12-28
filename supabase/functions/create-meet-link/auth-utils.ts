import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const COMPANY_CALENDAR_EMAIL = Deno.env.get('GOOGLE_CALENDAR_EMAIL');
const SERVICE_ACCOUNT_EMAIL = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
const SERVICE_ACCOUNT_PRIVATE_KEY = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');

export async function getAccessToken() {
  try {
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: getNumericDate(3600),
      iat: getNumericDate(0),
      sub: COMPANY_CALENDAR_EMAIL,
    };

    let privateKeyContent = SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!privateKeyContent.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKeyContent = `-----BEGIN PRIVATE KEY-----\n${privateKeyContent}\n-----END PRIVATE KEY-----`;
    }
    privateKeyContent = privateKeyContent.replace(/\\n/g, '\n');

    const pemContent = privateKeyContent
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
    
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      true,
      ["sign"]
    );

    const jwt = await create(
      { alg: "RS256", typ: "JWT" },
      claims,
      privateKey
    );

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw error;
  }
}