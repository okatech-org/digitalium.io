import dynamic from "next/dynamic";

const DemoAccountSwitcher = dynamic(
    () => import("@/components/shared/DemoAccountSwitcher"),
    { ssr: false }
);

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <DemoAccountSwitcher />
        </>
    );
}
