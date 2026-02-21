/**
 * REACT COMPONENT STRUCTURE
 * Rule: Functional components only. Always type props. Default values in destructuring.
 */

import React, { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// BASIC COMPONENT — props interface + defaults
// ─────────────────────────────────────────────

// ✅ GOOD
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
    >
      {children}
    </button>
  );
}

// ❌ BAD — untyped, no defaults
export function ButtonBad(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}

// ─────────────────────────────────────────────
// CONDITIONAL RENDERING — clear patterns
// ─────────────────────────────────────────────

interface DataDisplayProps {
  isLoading: boolean;
  error: Error | null;
  data: string[] | null;
}

// ✅ GOOD — one condition per line, readable
export function DataDisplay({ isLoading, error, data }: DataDisplayProps) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data) return null;

  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// ❌ BAD — ternary hell, unreadable
export function DataDisplayBad({ isLoading, error, data }: DataDisplayProps) {
  return isLoading ? (
    <Spinner />
  ) : error ? (
    <ErrorMessage message={error.message} />
  ) : data ? (
    <ul>{data.map((item, i) => <li key={i}>{item}</li>)}</ul>
  ) : null;
}

// ─────────────────────────────────────────────
// COMPONENT WITH DATA FETCHING
// ─────────────────────────────────────────────

interface Market {
  id: string;
  name: string;
  status: "active" | "resolved" | "closed";
}

interface MarketCardProps {
  marketId: string;
  onClose?: () => void;
}

// ✅ GOOD — clear structure: types → state → effects → handlers → render
export function MarketCard({ marketId, onClose }: MarketCardProps) {
  // State
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effects
  useEffect(() => {
    let cancelled = false;

    async function loadMarket() {
      try {
        setIsLoading(true);
        const data = await fetchMarket(marketId);
        if (!cancelled) setMarket(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadMarket();
    return () => { cancelled = true; }; // Cleanup to avoid state updates on unmount
  }, [marketId]);

  // Handlers
  function handleCloseClick() {
    onClose?.();
  }

  // Render
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!market) return null;

  return (
    <div className="market-card">
      <h2>{market.name}</h2>
      <span className={`status status-${market.status}`}>{market.status}</span>
      {onClose && <button onClick={handleCloseClick}>Close</button>}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENT SIZE RULE
// ─────────────────────────────────────────────

// ✅ GOOD — if a component grows beyond ~150 lines, extract sub-components

// Large component → split into:
// MarketList.tsx        (list container + fetching logic)
// MarketListItem.tsx    (single row rendering)
// MarketListFilters.tsx (filter controls)
// useMarketList.ts      (custom hook for data logic)

// Stubs
async function fetchMarket(id: string): Promise<Market> {
  return { id, name: "Example", status: "active" };
}
function Spinner() { return <div>Loading...</div>; }
function ErrorMessage({ message }: { message: string }) { return <div>{message}</div>; }
