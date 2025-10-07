import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface SignUpProps {
  onGoogleSignUp: () => void;
  onEmailSignUp: (name: string, email: string, password: string) => void;
  onSignInClick: () => void;
  isLoading?: boolean;
}

export default function SignUp({
  onGoogleSignUp,
  onEmailSignUp,
  onSignInClick,
  isLoading = false
}: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleCreateAccount = () => {
    if (name.trim() && email.trim() && password.trim() && acceptedTerms) {
      onEmailSignUp(name, email, password);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit) {
      handleCreateAccount();
    }
  };

  const canSubmit = name.trim() && email.trim() && password.trim() && acceptedTerms;

  return (
    <div
      className="bg-neutral-50 flex items-center justify-center min-h-screen w-full p-4"
      data-name="Ktirio AI // App design - Sign up"
    >
      <div
        className="bg-white relative rounded-2xl border border-[#e9ebef] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.06),0px_0px_1px_0px_rgba(0,0,0,0.04)] w-full max-w-[460px] p-10"
        data-name="Container"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="font-bold text-[26px] leading-[39px] text-[#030213] text-center tracking-[0.2158px]">
            Create your account
          </h1>
          <p className="font-normal text-[15px] leading-[22.5px] text-[#717182] text-center tracking-[-0.2344px]">
            Get started with Ktirio AI today
          </p>
        </div>

        {/* Google Sign Up Button */}
        <button
          onClick={onGoogleSignUp}
          disabled={isLoading}
          className="bg-white border border-[#e9ebef] rounded-[10px] h-12 w-full mb-8 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-[18px] h-[18px]"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
            <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
            <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54756 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05"/>
            <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
          </svg>
          <span className="font-medium text-[15px] text-[#030213] tracking-[-0.2344px]">
            Continue with Google
          </span>
        </button>

        {/* Divider */}
        <div className="relative h-[19.5px] mb-6">
          <div className="absolute border-t border-[#e9ebef] w-full top-[9.25px]" />
          <div className="absolute bg-white px-3 left-1/2 -translate-x-1/2">
            <span className="font-medium text-[13px] text-[#717182] tracking-[-0.0762px]">
              or
            </span>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="flex flex-col gap-5 mb-8">
          {/* Full Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[14px] text-[#030213] tracking-[-0.1504px]">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your full name"
              disabled={isLoading}
              className="bg-white border border-[#e9ebef] rounded-[10px] h-12 px-4 font-normal text-[15px] text-[#030213] placeholder:text-[#cbced4] tracking-[-0.2344px] focus:outline-none focus:ring-2 focus:ring-[#030213] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[14px] text-[#030213] tracking-[-0.1504px]">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email"
              disabled={isLoading}
              className="bg-white border border-[#e9ebef] rounded-[10px] h-12 px-4 font-normal text-[15px] text-[#030213] placeholder:text-[#cbced4] tracking-[-0.2344px] focus:outline-none focus:ring-2 focus:ring-[#030213] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[14px] text-[#030213] tracking-[-0.1504px]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Create a password"
              disabled={isLoading}
              className="bg-white border border-[#e9ebef] rounded-[10px] h-12 px-4 font-normal text-[15px] text-[#030213] placeholder:text-[#cbced4] tracking-[-0.2344px] focus:outline-none focus:ring-2 focus:ring-[#030213] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              disabled={isLoading}
              className="shrink-0 w-5 h-5 mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                className={`w-5 h-5 border-2 rounded ${
                  acceptedTerms
                    ? 'bg-[#030213] border-[#030213]'
                    : 'bg-white border-[#cbced4]'
                } flex items-center justify-center transition-colors`}
              >
                {acceptedTerms && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
            <label className="font-medium text-[14px] text-[#717182] leading-[21px] tracking-[-0.1504px]">
              I agree to the{' '}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Open Terms of Service
                  console.log('Open Terms of Service');
                }}
                className="text-[#030213] underline hover:opacity-70"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Open Privacy Policy
                  console.log('Open Privacy Policy');
                }}
                className="text-[#030213] underline hover:opacity-70"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Create Account Button */}
          <button
            onClick={handleCreateAccount}
            disabled={!canSubmit || isLoading}
            className="bg-[#030213] rounded-[10px] h-12 flex items-center justify-center gap-2 hover:bg-[#1a1a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-medium text-[15px] text-white tracking-[-0.2344px]">
              Create account
            </span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="font-normal text-[14px] text-[#717182] tracking-[-0.1504px]">
            Already have an account?{' '}
          </span>
          <button
            onClick={onSignInClick}
            disabled={isLoading}
            className="font-medium text-[16px] text-[#030213] tracking-[-0.3125px] underline hover:opacity-70 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
