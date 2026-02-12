"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "Comment DIGITALIUM s'intègre à nos outils existants ?",
        a: "Via notre API REST et nos connecteurs natifs. Intégrez DIGITALIUM à votre ERP, votre CRM ou vos outils comptables en quelques heures. Documentation complète et SDK disponibles.",
    },
    {
        q: "Combien de temps pour déployer DIGITALIUM dans mon entreprise ?",
        a: "Pour une PME : 30 minutes d'onboarding avec assistant guidé. Pour une institution : déploiement on-premise en 2-4 semaines avec formation sur site incluse.",
    },
    {
        q: "Nos données sont-elles vraiment stockées au Gabon ?",
        a: "Oui. Hébergement 100% souverain. Aucune donnée ne quitte le territoire gabonais. Conformité totale avec la réglementation locale et le RGPD.",
    },
    {
        q: "Peut-on migrer nos archives papier existantes ?",
        a: "Absolument. Notre service de migration bulk inclut la numérisation, l'OCR et la classification automatique par IA. Nous accompagnons chaque étape de la transition.",
    },
    {
        q: "DIGITALIUM fonctionne-t-il sur mobile ?",
        a: "Oui. Application PWA progressive disponible sur tous les appareils. Mode hors-ligne inclus avec synchronisation automatique dès le retour de la connexion.",
    },
    {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Mobile Money (MTN, Airtel, Moov), virement bancaire et carte bancaire. Le paiement Mobile Money est le plus simple et le plus rapide — activation instantanée.",
    },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="glass-card overflow-hidden"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={open}
            >
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                            {faq.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQSection() {
    return (
        <section id="faq" className="py-24 px-6 relative border-t border-white/5">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        Questions <span className="text-gradient">Fréquentes</span>
                    </h2>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} faq={faq} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
