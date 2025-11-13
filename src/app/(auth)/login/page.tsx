import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | CampusConnect ERP",
    description: "Login to your CampusConnect ERP account.",
};

export default function LoginPage() {
    return <LoginForm />;
}
