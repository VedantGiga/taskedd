// Re-export the Clerk components for easier imports
export { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn, ClerkProvider, UserButton } from "@clerk/clerk-react";

// Define a helper function to get the Clerk public key from env vars
export function getClerkPublishableKey() {
  return import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ;
}

// Set up custom auth headers for API requests
export const getAuthHeaders = (): HeadersInit => {
  // Get the session token from Clerk
  const token = sessionStorage.getItem("clerk-session-token") || localStorage.getItem("clerk-session-token");
  
  const headers: HeadersInit = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};
