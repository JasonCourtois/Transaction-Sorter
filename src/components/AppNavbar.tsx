"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import styles from "./AppNavbar.module.css";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = UserAuth();

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const linkClass = (href: string) =>
    `${styles.link}${pathname === href ? ` ${styles.linkActive}` : ""}`;

  return (
    <header className={styles.bar}>
      <Link href="/dashboard" className={styles.brand}>
        <strong>Transaction</strong> Sorter
      </Link>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
        <Link href="/dashboard/settings" className={linkClass("/dashboard/settings")}>
          User settings
        </Link>
      </nav>
      <div className={styles.actions}>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
