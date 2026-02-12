// DIGITALIUM.IO — SubAdmin layout wrapper
import SubAdminSpaceLayout from "@/components/layout/SubAdminSpaceLayout";

export default function SubAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SubAdminSpaceLayout>{children}</SubAdminSpaceLayout>;
}
