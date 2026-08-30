import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useChat } from '@ai-sdk/react';

function Test() {
  const chat = useChat({ api: '/api/chat' });
  console.log('useChat keys:', Object.keys(chat));
  return <div>Test</div>;
}

renderToStaticMarkup(<Test />);
