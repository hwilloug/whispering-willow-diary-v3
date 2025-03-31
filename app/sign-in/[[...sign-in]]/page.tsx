import { SignIn } from "@clerk/nextjs";
 
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-light/40 to-primary-dark/40 backdrop-blur-sm">
      <div className="w-full max-w-md p-4">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary-dark',
              card: 'bg-primary-light/40 backdrop-blur-md',
              headerTitle: 'text-primary-dark',
              headerSubtitle: 'text-primary-dark/80',
              socialButtonsBlockButton: 'bg-white hover:bg-gray-50',
              socialButtonsBlockButtonText: 'text-primary-dark font-medium',
              dividerLine: 'bg-primary-dark/20',
              dividerText: 'text-primary-dark/60',
              formFieldLabel: 'text-primary-dark',
              formFieldInput: 'bg-white/80 border-primary-light/30',
              footerActionLink: 'text-primary hover:text-primary-dark',
              identityPreviewText: 'text-primary-dark',
              identityPreviewEditButton: 'text-primary hover:text-primary-dark',
            },
          }}
          fallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  );
}