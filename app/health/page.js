// app/health/page.js
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HealthPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadHealth() {
      const res = await fetch("/api/health");
      const json = await res.json();
      setData(json);
    }
    loadHealth();
  }, []);

  return (
    <div className="min-h-screen flex">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-950/90 px-5 py-6">
        <div className="mb-8">
          <div className="text-xl font-semibold">TinyUrl</div>
          <div className="text-xs text-slate-400">Admin dashboard</div>
        </div>

        <nav className="space-y-2 text-sm">
          <Link href="/" className="block">
            <div className="px-3 py-2 hover:bg-slate-800 rounded-lg">
              Dashboard
            </div>
          </Link>

          <Link href="/health" className="block">
            <div className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              Health
            </div>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-8 py-6 space-y-8">
        <h1 className="text-2xl font-semibold text-white">System Health</h1>

        <div className="grid grid-cols-3 gap-4">

          {/* DB Status */}
          <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-xl">
            <div className="text-xs text-slate-400">Database</div>
            <div className="mt-2 text-xl text-emerald-300">
              {data?.db_status === "ok" ? "Online" : "Error"}
            </div>
          </div>

          {/* Uptime */}
          <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-xl">
            <div className="text-xs text-slate-400">Server Uptime</div>
            <div className="mt-2 text-xl text-emerald-300">
              {data?.uptime_human ?? "..."}
            </div>
          </div>

          {/* API Status */}
          <div className="p-4 border border-slate-800 bg-slate-900/60 rounded-xl">
            <div className="text-xs text-slate-400">API</div>
            <div className="mt-2 text-xl text-emerald-300">
              {data?.api_status === "ok" ? "Healthy" : "Down"}
            </div>
          </div>

        </div>

        {/* Detailed Section */}
        <div className="p-5 border border-slate-800 bg-slate-900/60 rounded-xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Detailed Status
          </h2>

          <div className="space-y-2 text-sm text-slate-300">

            <div className="flex justify-between">
              <span>Database Status:</span>
              <span className="text-slate-400">{data?.db_status}</span>
            </div>

            <div className="flex justify-between">
              <span>API Response Time:</span>
              <span className="text-slate-400">{data?.response_time_ms} ms</span>
            </div>

          
          </div>
        </div>

      </main>
    </div>
  );
}
