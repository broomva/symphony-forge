import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { MusicIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
      <div className="absolute inset-0 bg-muted" />
      <div className="relative z-20 flex items-center font-medium text-lg text-primary">
        <MusicIcon className="mr-2 h-6 w-6" />
        Symphony Cloud
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="relative z-20 mt-auto text-primary">
        <blockquote className="space-y-2">
          <p className="text-lg">
            &ldquo;Symphony automates our coding workflows so the team can focus
            on what matters — shipping great products.&rdquo;
          </p>
          <footer className="text-sm">Symphony Cloud</footer>
        </blockquote>
      </div>
    </div>
    <div className="lg:p-8">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
