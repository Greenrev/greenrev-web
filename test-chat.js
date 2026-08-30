async function test() {
  const req = {
    messages: [
      { role: "user", parts: [{ type: "text", text: "Hello" }] },
      { role: "assistant", parts: [{ type: "text", text: "Hi! How can I help?" }] },
      { role: "user", parts: [{ type: "text", text: "What is 1+1?" }] }
    ],
    compareData: []
  };

  console.log("Sending...");
  const res = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

test();
