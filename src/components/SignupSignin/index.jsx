import React from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";

function SignupSignin() {
  const location = useLocation();
  const loginForm = location.pathname === "/sign-in";

  const appearance = {
    variables: {
      colorPrimary: "#e6b04c",
      colorText: "#1a1a2e",
      colorTextSecondary: "#64748b",
      colorBackground: "#ffffff",
      colorInputBackground: "#ffffff",
      colorInputText: "#1a1a2e",
      borderRadius: "0.5rem",
      fontFamily: "'Public Sans', sans-serif",
      fontSize: "0.95rem",
    },
    elements: {
      card: "shadow-none border-0 rounded-none bg-transparent",
      headerTitle: "font-display text-xl font-bold text-foreground",
      headerSubtitle: "text-muted-foreground",
      formFieldLabel: "text-foreground font-medium",
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      dividerLine: "bg-border",
      dividerText: "text-muted-foreground",
      socialButtonsBlockButton: "border-border/60 text-foreground",
      footerActionLink: "text-primary",
      footerActionText: "text-muted-foreground",
    },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5 p-6">
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Spendly<span className="text-seal">.</span>
              </span>
            </div>
          </div>

          {loginForm ? (
            <SignIn
              appearance={appearance}
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          ) : (
            <SignUp
              appearance={appearance}
              fallbackRedirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SignupSignin;