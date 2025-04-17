export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || "your-auth0-domain",
  clientId: process.env.AUTH0_CLIENT_ID || "your-auth0-client-id",
  redirectUri: process.env.AUTH0_REDIRECT_URI || "http://localhost:3000/callback",
}

