"use client";

import { useRef, useState } from "react";

const Home = () => {
  const inputRef = useRef<null | HTMLTextAreaElement>(null);
  const [response, setResponse] = useState("");

  const handleClick = async () => {
    const input = inputRef.current?.value;
    if (!input) throw new Error("No input");

    setResponse("...Loading");
    const response = await fetch("/openai-stream", { method: "POST", body: JSON.stringify({ prompt: input }) });
    setResponse("");
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
  };

  return (
    <div>
      <section>
        <label>
          Input prompt:
          <textarea ref={inputRef} />
        </label>
      </section>
      <section>
        <button onClick={handleClick}>Generate response</button>
      </section>
      <hr />
      <p>{response}</p>
    </div>
  );
};

export default Home;
