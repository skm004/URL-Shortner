"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [error, setError] = useState("");
  const [clicks, setClicks] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  useEffect(() => {
    if (!shortUrl) return;

    const interval = setInterval(async () => {
      const code = shortUrl.split("/").pop();
      const statsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stats/${code}`,
      );
      const statsData = await statsRes.json();

      setClicks(statsData.clicks);
    }, 3000);

    return () => clearInterval(interval);
  }, [shortUrl]);

  const handleShorten = async () => {
    try {
      setError("");
      setShortUrl("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ originalUrl, customCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Custom code already taken");
        return;
      }

      setShortUrl(data.shortUrl);

      const code = data.shortUrl.split("/").pop();
      const statsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stats/${code}`,
      );
      const statsData = await statsRes.json();
      setClicks(statsData.clicks);
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const refreshStats = async () => {
    if (!shortUrl) return;

    const code = shortUrl.split("/").pop();

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const statsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stats/${code}`,
    );

    const statsData = await statsRes.json();

    setClicks(statsData.clicks);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-5">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white">
          Shorten Your Links
        </h1>

        <p className="text-center text-gray-400 text-sm">
          Fast • Secure • Reliable URL Shortener
        </p>

        <input
          type="text"
          placeholder="Enter your URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="bg-black/30 text-white border border-gray-600 p-3 rounded-lg placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />

        <input
          type="text"
          placeholder="Custom short code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          className="bg-black/30 text-white border border-gray-600 p-3 rounded-lg placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />

        <button
          onClick={handleShorten}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white py-3 rounded-lg font-semibold transition"
        >
          Shorten URL
        </button>

        {error && (
          <p className="text-red-400 text-center font-medium">{error}</p>
        )}

        {shortUrl && (
          <div className="flex flex-col gap-3 items-center bg-black/30 p-4 rounded-lg border border-gray-700">
            <a
              href={shortUrl}
              target="_blank"
              className="text-blue-400 underline break-all text-center"
            >
              {shortUrl}
            </a>

            <div className="flex gap-3 items-center">
              <button
                onClick={copyToClipboard}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg"
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              {clicks !== null && (
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  Clicks: {clicks}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
