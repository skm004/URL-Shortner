"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async () => {
    try {
      setError("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid Credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      
      window.dispatchEvent(new Event("authChange"));

      router.push("/");
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl flex flex-col gap-4 w-80">
        <h1 className="text-white text-2xl font-bold text-center">Login</h1>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
}
