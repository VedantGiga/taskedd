import { SignUp } from "@/lib/clerk";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary-600 dark:text-primary-400">Create an account</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Join TaskFlow to manage your tasks efficiently</p>
        </div>
        
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white',
              card: 'bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            },
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="/"
        />
      </div>
    </div>
  );
}