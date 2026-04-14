import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import JsonLd from "./JsonLd";

interface BreadcrumbItem {
    label: string;
    href: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    const breadcrumbListJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://bscca.bandhannova.in"
            },
            ...items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": item.label,
                "item": `https://bscca.bandhannova.in${item.href}`
            }))
        ]
    };

    return (
        <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <JsonLd data={breadcrumbListJsonLd} />
            <Link href="/" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Home className="w-3 h-3" />
                <span>Home</span>
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                    {index === items.length - 1 ? (
                        <span className="text-foreground">{item.label}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-accent transition-colors">
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}
