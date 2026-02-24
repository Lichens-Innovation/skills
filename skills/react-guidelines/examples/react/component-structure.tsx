/**
 * REACT COMPONENT STRUCTURE
 * Rule: Functional components only. Always type props. Default values in destructuring.
 */

import React, { useState, useEffect, FunctionComponent } from "react";

// ─────────────────────────────────────────────
// BASIC COMPONENT — props interface + defaults (no inline types)
// ─────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  onClick: VoidFunction;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${variant} btn-${size}`}
  >
    {children}
  </button>
);

// ❌ BAD — untyped, no defaults
export const ButtonBad: FunctionComponent<any> = (props) => (
  <button onClick={props.onClick}>{props.children}</button>
);

// ❌ BAD — not using arrow function and not using destructuring for arguments
export function ButtonBadFunction(props: ButtonProps) {
  return (
    <button onClick={props.onClick}>{props.children}</button>
  );
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
export const DataDisplay: FunctionComponent<DataDisplayProps> = ({
  isLoading,
  error,
  data,
}) => {
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
};

// ❌ BAD — ternary hell, unreadable (multiple nested ternary operators)
export const DataDisplayBad: FunctionComponent<DataDisplayProps> = ({
  isLoading,
  error,
  data,
}) =>
  isLoading ? (
    <Spinner />
  ) : error ? (
    <ErrorMessage message={error.message} />
  ) : data ? (
    <ul>{data.map((item, i) => <li key={i}>{item}</li>)}</ul>
  ) : null;

// ─────────────────────────────────────────────
// COMPONENT WITH DATA FETCHING
// ─────────────────────────────────────────────

type MarketStatus = "active" | "resolved" | "closed";

interface Market {
  id: string;
  name: string;
  status: MarketStatus;
}

interface MarketCardProps {
  marketId: string;
  onClose?: VoidFunction;
}

// ✅ GOOD — clear structure: types → state → effects → handlers → render
export const MarketCard: FunctionComponent<MarketCardProps> = ({
  marketId,
  onClose,
}) => {
  // State
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effects
  useEffect(() => {
    let cancelled = false;

    const loadMarket = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMarket(marketId);
        if (!cancelled) setMarket(data);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadMarket();
    return () => { cancelled = true; }; // Cleanup to avoid state updates on unmount
  }, [marketId]);

  // Handlers
  const handleCloseClick = () => {
    onClose?.();
  };

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
};

// ─────────────────────────────────────────────
// COMPONENT SIZE RULE
// ─────────────────────────────────────────────

// ✅ GOOD — if a component grows beyond ~100 lines, extract sub-components

// Large component → split into:
// market-list.tsx        (list container + fetching logic)
// market-list-item.tsx    (single row rendering)
// market-list-filters.tsx (filter controls)
// use-market-list.ts      (custom hook for data logic)

// Stubs
const fetchMarket = async (id: string): Promise<Market> =>
  ({ id, name: "Example", status: "active" });
const Spinner = () => <div>Loading...</div>;

interface ErrorMessageProps {
  message: string;
}
const ErrorMessage: FunctionComponent<ErrorMessageProps> = ({ message }) => (
  <div>{message}</div>
);
