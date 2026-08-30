import { streamText, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const maxDuration = 30;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

/** Fetch lightweight vehicle summaries from the backend */
async function fetchInventory(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/products?category=vehicle`, {
      next: { revalidate: 60 }, // cache for 60s on Vercel / Next cache
    });
    if (!res.ok) return '';
    const data = await res.json();
    if (!data.success || !data.data?.products?.length) return '';

    const vehicles = data.data.products.map((p: any) => ({
      name: p.name,
      make: p.make,
      price: p.price ? `₦${Number(p.price).toLocaleString()}` : 'Price on request',
      horsepower: p.specs?.horsepower ?? 'N/A',
      topSpeed: p.specs?.topSpeed ?? 'N/A',
      '0_100': p.specs?.['0_100'] ?? 'N/A',
      torque: p.specs?.torque ?? 'N/A',
    }));

    return `\n\n## GreenRev Showroom Inventory (${vehicles.length} vehicles available)\n${JSON.stringify(vehicles, null, 2)}\n\nWhen suggesting alternatives or similar vehicles, ONLY reference cars from this list.`;
  } catch {
    return '';
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response("Error: OPENROUTER_API_KEY is missing.", { status: 500 });
  }

  const { messages, compareData } = await req.json();

  const openrouter = createOpenRouter({ apiKey });

  // Fetch inventory and compare context in parallel
  const [inventoryContext] = await Promise.all([fetchInventory()]);

  const compareContext =
    compareData && compareData.length > 0
      ? `\n\n## Currently Comparing\nThe user is comparing these specific vehicles:\n${JSON.stringify(
          compareData.map((c: any) => ({
            name: c.name,
            make: c.make,
            price: c.price ? `₦${Number(c.price).toLocaleString()}` : 'Price on request',
            horsepower: c.specs?.horsepower,
            topSpeed: c.specs?.topSpeed,
            '0_100': c.specs?.['0_100'],
            torque: c.specs?.torque,
          })),
          null,
          2
        )}\nAnswer all questions using this data as the primary reference.`
      : '';

  try {
    const coreMessages = await convertToModelMessages(messages);

    // Flatten array content to plain strings — OpenRouter/Google rejects array-type content
    const cleanMessages = coreMessages.map((m: any) => {
      if (Array.isArray(m.content)) {
        m.content = m.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join('');
      }
      return m;
    });

    const result = await streamText({
      model: openrouter('google/gemma-4-31b-it'),
      system: `You are the GreenRev Moto AI Concierge, a world-class automotive expert for a premium Nigerian car dealership called GreenRev Motors.${compareContext}${inventoryContext}

## Guidelines
- Be sophisticated, professional, and conversational — like a luxury car consultant.
- Use markdown for readability: **bold** for key specs, bullet lists for comparisons.
- Give definitive, opinionated recommendations when asked.
- When suggesting similar or alternative vehicles, ONLY recommend cars from the GreenRev Showroom Inventory above.
- If a requested car type isn't in the inventory, say so honestly and suggest the closest match from inventory.
- Never invent prices. Always use prices from the inventory data above.`,
      messages: cleanMessages,
    });

    // @ts-ignore
    const response = result.toUIMessageStreamResponse();
    response.headers.set('X-Accel-Buffering', 'no');
    response.headers.set('Cache-Control', 'no-cache, no-transform');
    return response;
  } catch (err: any) {
    console.error("Stream error:", err?.message ?? err);
    return new Response(
      JSON.stringify({ message: err.message, name: err.name }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
