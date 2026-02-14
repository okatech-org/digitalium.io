import Link from "next/link";
import Image from "next/image";

export default function FooterSection() {
    return (
        <footer className="border-t border-white/5 py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Image src="/logo_digitalium.png" alt="DIGITALIUM.IO" width={32} height={32} className="h-8 w-8 rounded-lg" />
                            <span className="font-bold text-lg text-gradient">
                                DIGITALIUM.IO
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Plateforme souveraine d&apos;archivage intelligent et de gestion
                            documentaire pour le Gabon.
                        </p>
                    </div>

                    {/* Solutions */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Solutions</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>
                                <Link
                                    href="/solutions/administrations"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Administrations
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/solutions/entreprises"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Entreprises
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/solutions/organismes"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Organismes
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://identite.ga/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Particuliers
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Modules */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Modules</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>
                                <Link
                                    href="#modules"
                                    className="hover:text-foreground transition-colors"
                                >
                                    iDocument
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#modules"
                                    className="hover:text-foreground transition-colors"
                                >
                                    iArchive
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#modules"
                                    className="hover:text-foreground transition-colors"
                                >
                                    iSignature
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#modules"
                                    className="hover:text-foreground transition-colors"
                                >
                                    iAsted
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Entreprise */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Entreprise</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>
                                <Link
                                    href="#pricing"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Tarifs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#faq"
                                    className="hover:text-foreground transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <span className="cursor-default">Conditions générales</span>
                            </li>
                            <li>
                                <span className="cursor-default">
                                    Politique de confidentialité
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Contact</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                            <li>contact@digitalium.io</li>
                            <li>+241 XX XX XX XX</li>
                            <li>Libreville, Gabon 🇬🇦</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © 2026 DIGITALIUM — Libreville, Gabon. Tous droits réservés.
                    </p>
                    <p className="text-[10px] text-muted-foreground/50">
                        Fièrement conçu au Gabon 🇬🇦
                    </p>
                </div>
            </div>
        </footer>
    );
}

