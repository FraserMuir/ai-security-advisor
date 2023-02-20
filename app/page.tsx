"use client";

import { useRef, useState } from "react";

const LoadingStates = {
  IDLE: "idle",
  LOADING: "loading",
  GENERATING: "generating",
} as const;

const Home = () => {
  const formRef = useRef<null | HTMLFormElement>(null);
  const [response, setResponse] = useState("");
  const [loadingState, setLoadingState] = useState<typeof LoadingStates[keyof typeof LoadingStates]>(LoadingStates.IDLE);

  const handleClick = async () => {
    const form = formRef.current;
    if (!form) throw new Error("No form");

    setLoadingState(LoadingStates.LOADING);
    setResponse("");

    const values = [...new FormData(form).entries()].reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    const response = await fetch("/openai-stream", { method: "POST", body: JSON.stringify(values) });
    if (!response.ok) throw new Error(response.statusText);

    const data = response.body;
    if (!data) throw new Error("No response body");

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResponse((prev) => prev + chunkValue);
    }

    setLoadingState(LoadingStates.IDLE);
  };

  const recommendations = response
    .split(/\d\.\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <main>
      <h1>AI Security Advisor</h1>
      <p>Tell us some information about your organisation...</p>
      <form ref={formRef}>
        <label>
          Company Name
          <input name="name" />
        </label>
        <label>
          Employee Size
          <input name="size" type="number" min={0} />
        </label>
        <label>
          Industry
          <input name="industry" />
        </label>
      </form>
      <button onClick={handleClick}>
        {loadingState === LoadingStates.GENERATING
          ? "Generating..."
          : loadingState === LoadingStates.LOADING
          ? "Loading..."
          : "Generate response"}
      </button>
      {recommendations.map((recommendation, i) => (
        <div className="recommendation" key={i}>{recommendation}</div>
      ))}
    </main>
  );
};

export default Home;
