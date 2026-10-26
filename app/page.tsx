
"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function summarizeText() {
    setError("");
    setSummary("");

    if (!text.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    if (text.length > 12000) {
      setError("Please keep your text under 12,000 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, length }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong.");
      }

      if (!response.body) {
        throw new Error("No response received from the server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setSummary((previous) => previous + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold">S</div>
            <div>
              <h1 className="text-xl font-bold">SimplyAI</h1>
              <p className="text-xs text-slate-400">AI Text Summarizer</p>
            </div>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">Powered by AI</span>
        </header>

        <section className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">Read less. Understand more.</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your words, <span className="text-violet-400">simplified.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Turn long articles, notes, and documents into clear, useful summaries in seconds.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="sourceText" className="font-semibold">Your text</label>
              <span className="text-xs text-slate-400">{text.length.toLocaleString()} / 12,000</span>
            </div>

            <textarea
              id="sourceText"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste an article, lecture notes, or any text you want to summarize..."
              maxLength={12000}
              className="min-h-72 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-violet-500"
            />

            <div className="mt-5">
              <label htmlFor="length" className="mb-2 block text-sm font-medium text-slate-300">Summary length</label>
              <select
                id="length"
                value={length}
                onChange={(event) => setLength(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
              >
                <option value="short">Short — key points only</option>
                <option value="medium">Medium — balanced summary</option>
                <option value="detailed">Detailed — more context</option>
              </select>
            </div>

            <button
              onClick={summarizeText}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating summary..." : "✦ Summarize text"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">Your text is processed by the configured AI service.</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold">Your summary</h3>
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-300">AI generated</span>
            </div>

            {error && (
              <div role="alert" className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {summary ? (
              <div className="whitespace-pre-wrap text-sm leading-8 text-slate-200">{summary}</div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">✦</div>
                <p className="font-medium text-slate-300">{loading ? "Writing your summary..." : "Your summary will appear here"}</p>
                <p className="mt-2 max-w-xs text-sm text-slate-500">
                  Paste your text, choose a length, and click Summarize to get started.
                </p>
              </div>
            )}

            {loading && <p className="mt-4 animate-pulse text-xs text-violet-300">Generating…</p>}

            {summary && !loading && (
              <button
                onClick={() => navigator.clipboard.writeText(summary)}
                className="mt-6 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Copy summary
              </button>
            )}
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-500">
          SimplyAI · Built with Next.js and AI
        </footer>
      </div>
    </main>
  );
}
