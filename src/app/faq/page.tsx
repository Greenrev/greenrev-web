import type { Metadata } from "next";
import FaqView from "@/components/faq/FaqView";

export const metadata: Metadata = {
  title: "FAQ | GreenRev",
  description:
    "Answers about finding cars, parts and mechanics on GreenRev, selling as a business, fees, safety and getting support.",
};

export default function FaqPage() {
  return <FaqView />;
}
