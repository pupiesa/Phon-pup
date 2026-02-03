import React, { useState, useEffect } from "react";

const AGE_VERIFIED_KEY = "phon-pup-age-verified";

function AgeVerification({ children }) {
  const [verified, setVerified] = useState(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem(AGE_VERIFIED_KEY);
    setVerified(isVerified === "true");
  }, []);

  const handleVerify = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    setVerified(true);
  };

  const handleExit = () => {
    setExiting(true);
    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 500);
  };

  // Still checking localStorage
  if (verified === null) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already verified
  if (verified) {
    return children;
  }

  // Show age verification modal
  return (
    <div className={`min-h-screen bg-dark flex items-center justify-center p-4 transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-dark">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-[150px]" />
        </div>
      </div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <img src="/logo.jpg" alt="Phon-Pup" className="h-24 w-auto mx-auto rounded-lg" />
          </div>

          {/* Warning Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-orange-main/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-orange-main"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Age Verification Required
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            This website contains content intended for adults only. 
            By entering, you confirm that you are at least{" "}
            <span className="text-orange-main font-bold">18 years old</span> or 
            the age of majority in your jurisdiction.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              className="w-full py-3 px-4 btn-primary text-black font-bold rounded-lg text-lg transition-all hover:scale-[1.02]"
            >
              I am 18 or older — Enter
            </button>
            <button
              onClick={handleExit}
              className="w-full py-3 px-4 bg-dark text-gray-400 hover:text-white hover:bg-card-hover rounded-lg transition-all"
            >
              I am under 18 — Exit
            </button>
          </div>

          {/* Legal Text */}
          <p className="mt-6 text-xs text-gray-600 leading-relaxed">
            By clicking "Enter", you agree to our terms of service and 
            confirm you are of legal age to view adult content in your region.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgeVerification;
