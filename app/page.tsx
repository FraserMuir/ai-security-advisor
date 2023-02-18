"use client";

import { useRef, useState } from "react";

const LoadingStates = {
  IDLE: "idle",
  LOADING: "loading",
  GENERATING: "generating",
} as const;

const Home = () => {
  const inputRef = useRef<null | HTMLTextAreaElement>(null);
  const [response, setResponse] = useState("");
  const [loadingState, setLoadingState] = useState<typeof LoadingStates[keyof typeof LoadingStates]>(LoadingStates.IDLE);

  const handleClick = async () => {
    const input = inputRef.current?.value;
    if (!input) throw new Error("No input");

    setLoadingState(LoadingStates.LOADING);
    setResponse("");
    const response = await fetch("/openai-stream", { method: "POST", body: JSON.stringify({ prompt: input }) });
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

  return (
    <main>
      <h1>AI Security Advisor</h1>
      <textarea ref={inputRef} placeholder="Enter prompt" />
      <button onClick={handleClick}>
        {loadingState === LoadingStates.GENERATING
          ? "Generating..."
          : loadingState === LoadingStates.LOADING
          ? "Loading..."
          : "Generate response"}
      </button>
      <p>{response}</p>
    </main>
  );
};

export default Home;
