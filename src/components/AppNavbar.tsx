"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import categoriesData from "@/app/dashboard/data/categories.json";
import { SpendBreakdownItem } from "@/app/dashboard/dashboard.types";
import styles from "./AppNavbar.module.css";
import { formatCategory } from "@/app/dashboard/formatCategory";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = UserAuth();

  const categories = categoriesData as SpendBreakdownItem[];

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
        {categories.map((category, index) => (
          <Link
            key={index}
            href={"/dashboard/" + category.name.toLowerCase()}
            className={linkClass("/dashboard/" + category.name.toLowerCase())}
          >
            {formatCategory(category.name)}
          </Link>
        ))}
      </nav>
      <div className={styles.actions}>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
