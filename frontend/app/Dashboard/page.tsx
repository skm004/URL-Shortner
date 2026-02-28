"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchUrls = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-urls`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUrls(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();

    const interval = setInterval(fetchUrls, 5000);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (code: string) => {
    const link = `${process.env.NEXT_PUBLIC_API_URL}/${code}`;
    navigator.clipboard.writeText(link);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My URLs</h1>

      {loading && <p>Loading...</p>}

      {!loading && urls.length === 0 && (
        <p className="text-gray-400">No URLs created yet.</p>
      )}

      {!loading && urls.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3 text-left">Original URL</th>
                <th className="p-3 text-left">Short Link</th>
                <th className="p-3 text-left">Clicks</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {urls.map((url) => (
                <tr key={url._id} className="border-t border-gray-800">
                  <td className="p-3 truncate max-w-xs">{url.originalUrl}</td>

                  <td className="p-3 text-blue-400">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/${url.shortCode}`}
                      target="_blank"
                    >
                      {url.shortCode}
                    </a>
                  </td>

                  <td className="p-3">{url.clicks}</td>

                  <td className="p-3">
                    <button
                      onClick={() => copyToClipboard(url.shortCode)}
                      className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
