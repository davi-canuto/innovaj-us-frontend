
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
      <Toaster richColors position="top-center" expand={false}/>
    </div>
  );
}
