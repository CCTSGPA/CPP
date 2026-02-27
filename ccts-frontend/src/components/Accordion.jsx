import React, { useState } from "react";

export default function Accordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="card">
          <button
            className="w-full text-left flex items-center justify-between"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="font-medium">{it.q}</div>
            <div className="text-neutral-500">
              {openIndex === i ? "−" : "+"}
            </div>
          </button>
          {openIndex === i && (
            <div className="mt-2 text-sm text-neutral-700">{it.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
