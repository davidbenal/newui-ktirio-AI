import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8] px-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0",
              headerTitle: "text-2xl font-semibold",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton:
                "border-gray-300 hover:bg-gray-50 transition-colors",
              socialButtonsBlockButtonText: "font-medium",
              dividerLine: "bg-gray-300",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-700 font-medium",
              formFieldInput:
                "border-gray-300 focus:border-black focus:ring-2 focus:ring-black/20",
              formButtonPrimary:
                "bg-black hover:bg-gray-800 text-white font-medium shadow-sm transition-all duration-200 hover:shadow-md",
              footerActionLink: "text-black hover:text-gray-700 font-medium",
              identityPreviewText: "text-gray-700",
              formResendCodeLink: "text-black hover:text-gray-700",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/welcome"
        />
      </div>
    </div>
  );
}
