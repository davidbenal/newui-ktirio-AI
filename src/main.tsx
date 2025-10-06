import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import App from "./App.tsx";
import SignInPage from "./pages/SignInPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: "#000000",
            colorText: "#1F2937",
            colorTextSecondary: "#6B7280",
            colorBackground: "#FFFFFF",
            colorInputBackground: "#FFFFFF",
            colorInputText: "#1F2937",
            fontFamily: "system-ui, -apple-system, sans-serif",
            borderRadius: "0.5rem",
          },
          elements: {
            formButtonPrimary:
              "bg-black hover:bg-gray-800 text-white font-medium transition-colors",
            card: "shadow-lg",
            formFieldInput:
              "border-gray-300 focus:border-black focus:ring-black",
            footerActionLink: "text-black hover:text-gray-700",
          },
        }}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <>
                <SignedIn>
                  <App />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
  