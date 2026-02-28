"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener("authChange", checkAuth);

    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChange"));
    setOpen(false);
    router.push("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center relative">
      
      <Link href="/" className="text-xl font-bold text-white">
        URL Shortener
      </Link>

      <button
        onClick={() => setOpen(!open)}
        className="text-white"
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-6 top-16 bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-4 w-48 flex flex-col gap-3"
        >
          {isLoggedIn ? (
            <>
              <Link
                href="/Dashboard"
                className="hover:text-blue-400"
                onClick={() => setOpen(false)}
              >
                My Links
              </Link>

              <button
                onClick={handleLogout}
                className="text-left hover:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-blue-400"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="hover:text-blue-400"
                onClick={() => setOpen(false)}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}