export default function Footer() {
    return (
        <footer className="bg-white border-t border-border py-12 mt-auto mb-14 sm:mb-0">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="BSCCA Logo" className="h-10 w-10 object-contain" />
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                Beltala Supreme Council of Cricket Authority
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Official Tournament Authority · Est. 2026
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { href: "https://www.facebook.com/bscca07", label: "Facebook" },
                            { href: "#", label: "Instagram" },
                            { href: "#", label: "YouTube" },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        © 2026 BSCCA, BandhanNova Platforms. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
