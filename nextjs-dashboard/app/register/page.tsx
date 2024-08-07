import AcmeLogo from '@/app/ui/acme-logo';
import RegisterForm from '@/app/ui/register-form';
import Link from 'next/link';
 
export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-lime-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <RegisterForm />
        <Link href="/login" className="text-sm text-cyan-500 underline text-center">
          Login
        </Link>
      </div>
    </main>
  );
}