async function test() {
  const req = {
    messages: [
      { role: "user", content: "Hello" }
    ],
    compareData: []
  };

  console.log("Sending single message...");
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
