
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("LoginLayout renderizou")

  return (
    <html lang="en">
      <body
        className={`antialiased w-full` }
      >
        {children}
         <Toaster richColors position="top-center" expand={false}/>
      </body>
    </html>
  );
}
