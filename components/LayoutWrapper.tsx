"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main className="flex-grow pt-0 pb-20 sm:pt-20 sm:pb-0 transition-all duration-300">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
            <Footer />
        </>
    );
}
