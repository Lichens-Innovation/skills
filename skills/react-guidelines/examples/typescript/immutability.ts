/**
 * IMMUTABILITY PATTERNS
 * Rule: NEVER mutate objects or arrays directly.
 *       Always return new values using spread operator or immutable methods.
 */

// ─────────────────────────────────────────────
// OBJECTS
// ─────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  role: "admin" | "user";
  settings: { theme: string; language: string };
}

const user: User = {
  id: "1",
  name: "Alice",
  role: "user",
  settings: { theme: "dark", language: "fr" },
};

// ✅ GOOD — spread operator creates a new object
const updatedUser = { ...user, name: "Alice Smith" };

// ✅ GOOD — nested update (always spread nested objects too)
const updatedSettings = {
  ...user,
  settings: { ...user.settings, theme: "light" },
};

// ❌ BAD — direct mutation
user.name = "Alice Smith"; // mutates original
user.settings.theme = "light"; // mutates nested object

// ─────────────────────────────────────────────
// ARRAYS
// ─────────────────────────────────────────────

const items = ["apple", "banana", "cherry"];

// ✅ GOOD — adding items
const withNewItem = [...items, "date"];
const withItemAtStart = ["mango", ...items];

// ✅ GOOD — removing items
const withoutBanana = items.filter((item) => item !== "banana");

// ✅ GOOD — updating an item by index
const updatedItems = items.map((item, index) =>
  index === 1 ? "BANANA" : item
);

// ✅ GOOD — sorting (sort mutates! always copy first)
const sorted = [...items].sort();

// ❌ BAD — mutating array methods
items.push("date");       // mutates
items.splice(1, 1);       // mutates
items.sort();             // mutates — sorts in place

// ─────────────────────────────────────────────
// ARRAYS OF OBJECTS — common Redux/state pattern
// ─────────────────────────────────────────────

interface Market {
  id: string;
  name: string;
  status: "active" | "closed";
}

const markets: Market[] = [
  { id: "1", name: "Market A", status: "active" },
  { id: "2", name: "Market B", status: "active" },
];

// ✅ GOOD — update one item in a list
const updatedMarkets = markets.map((market) =>
  market.id === "1" ? { ...market, status: "closed" } : market
);

// ✅ GOOD — remove one item from a list
const filteredMarkets = markets.filter((market) => market.id !== "2");

// ✅ GOOD — add an item to a list
const newMarket: Market = { id: "3", name: "Market C", status: "active" };
const expandedMarkets = [...markets, newMarket];
