import { renderHook } from '@testing-library/react-hooks';
import { useChat } from '@ai-sdk/react';

console.log("Checking useChat keys...");
try {
  const result = useChat({ api: '/api/chat' });
  console.log(Object.keys(result));
} catch (e) {
  console.error(e);
}
