/**
 * CODE SMELLS — Detection & Refactoring Guide
 * Use during code review to identify patterns that indicate deeper problems.
 */

// ─────────────────────────────────────────────
// SMELL 1: LONG FUNCTION (>50 lines)
// Signal: Scrolling to understand a single function
// Fix: Extract into smaller, named functions
// ─────────────────────────────────────────────

// ❌ SMELL — 80-line function doing 5 things
async function processOrderBad(orderId: string) {
  // 15 lines: validate order
  // 15 lines: check inventory
  // 15 lines: charge payment
  // 15 lines: update database
  // 15 lines: send confirmation email
  // 5 lines: return result
}

// ✅ REFACTORED — each step is named and testable
async function processOrder(orderId: string) {
  const order = await validateAndFetchOrder(orderId);
  await checkInventoryAvailability(order);
  const payment = await chargePayment(order);
  await persistOrderCompletion(order, payment);
  await sendOrderConfirmation(order);
  return { success: true, orderId };
}

// ─────────────────────────────────────────────
// SMELL 2: LONG PARAMETER LIST (>3 params)
// Signal: f(a, b, c, d, e, f) — hard to remember order
// Fix: Introduce a params object
// ─────────────────────────────────────────────

// ❌ SMELL
function createUser(
  name: string,
  email: string,
  role: string,
  teamId: string,
  isVerified: boolean,
  sendWelcomeEmail: boolean
) {}

// ✅ REFACTORED
interface CreateUserParams {
  name: string;
  email: string;
  role: string;
  teamId: string;
  isVerified?: boolean;        // optional with default
  sendWelcomeEmail?: boolean;  // optional with default
}

function createUserClean({ name, email, role, teamId, isVerified = false, sendWelcomeEmail = true }: CreateUserParams) {}

// ─────────────────────────────────────────────
// SMELL 3: BOOLEAN FLAG PARAMETER
// Signal: fn(data, true) — what does `true` mean?
// Fix: Use an options object or separate functions
// ─────────────────────────────────────────────

// ❌ SMELL — `true` is meaningless at call site
function fetchMarkets(userId: string, includeArchived: boolean) {}
fetchMarkets("u1", true); // True what? Has to look at definition

// ✅ OPTION A — named options object
function fetchMarketsClean(userId: string, options?: { includeArchived?: boolean }) {}
fetchMarketsClean("u1", { includeArchived: true }); // Self-documenting

// ✅ OPTION B — separate functions when behavior diverges significantly
function fetchActiveMarkets(userId: string) {}
function fetchAllMarkets(userId: string) {}

// ─────────────────────────────────────────────
// SMELL 4: DUPLICATED CODE (DRY violation)
// Signal: Copy-paste with minor variations
// Fix: Extract parameterized function
// ─────────────────────────────────────────────

// ❌ SMELL — nearly identical blocks
async function getActiveMarketsForUser(userId: string) {
  const response = await fetch(`/api/markets?userId=${userId}&status=active`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function getClosedMarketsForUser(userId: string) {
  const response = await fetch(`/api/markets?userId=${userId}&status=closed`); // copy-paste
  if (!response.ok) throw new Error(`HTTP ${response.status}`);               // copy-paste
  return response.json();
}

// ✅ REFACTORED — parameterized
type MarketStatus = "active" | "closed" | "resolved";

async function getMarketsForUser(userId: string, status: MarketStatus) {
  const response = await fetch(`/api/markets?userId=${userId}&status=${status}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ─────────────────────────────────────────────
// SMELL 5: PRIMITIVE OBSESSION
// Signal: Passing raw strings/numbers where a typed value would clarify
// Fix: Create value objects or branded types
// ─────────────────────────────────────────────

// ❌ SMELL — what does each string represent?
function transferFunds(from: string, to: string, amount: number) {}
transferFunds("u_123", "u_456", 50.00); // Which is userId? accountId?

// ✅ REFACTORED — branded types
type UserId = string & { readonly _brand: "UserId" };
type AccountId = string & { readonly _brand: "AccountId" };
type USD = number & { readonly _brand: "USD" };

function transferFundsClean(from: AccountId, to: AccountId, amount: USD) {}

// ─────────────────────────────────────────────
// SMELL 6: SHOTGUN SURGERY
// Signal: Changing one feature requires edits in 8+ files
// Fix: Co-locate related logic; reduce coupling
// ─────────────────────────────────────────────

// ❌ SMELL — "market status" logic scattered across:
// components/MarketCard.tsx     → renders status badge
// utils/formatMarket.ts         → formats status string
// hooks/useMarkets.ts           → filters by status
// api/markets.ts                → validates status values
// types/market.types.ts         → defines status type
// constants/marketStatus.ts     → stores status constants
// All must change when adding a new status

// ✅ REFACTORED — centralize in a domain module
// modules/market/
//   index.ts      → exports public API
//   types.ts      → MarketStatus type + interfaces
//   status.ts     → all status logic: display, color, filter, validate

// ─────────────────────────────────────────────
// SMELL 7: COMMENTS EXPLAINING WHAT (not why)
// Signal: Comment restates the code
// Fix: Rename to make code self-explanatory; comments for WHY only
// ─────────────────────────────────────────────

// ❌ SMELL — comment explains what
// Add 1 to count
let count = 0;
count = count + 1;

// ❌ SMELL — comment compensates for bad name
// Check if user can edit
function check(u: any): boolean { return u.role === "admin"; }

// ✅ GOOD — name is self-explanatory, comment explains why
function canEditMarket(user: { role: string }): boolean {
  return user.role === "admin";
}

// ✅ GOOD — comment explains non-obvious decision (the WHY)
// We use 1500ms instead of 1000ms because the upstream API
// has a documented 1200ms cold-start on cache miss
const SEARCH_DEBOUNCE_MS = 1500;

// ─────────────────────────────────────────────
// QUICK SMELL CHECKLIST (for code review)
// ─────────────────────────────────────────────

// Ask these questions about any function or module:
// [ ] Can I understand this in 30 seconds? → if no: too complex
// [ ] Does it do more than one thing? → if yes: split it
// [ ] Would changing this require touching >3 files? → if yes: coupling issue
// [ ] Are any names unclear without context? → if yes: rename
// [ ] Is there copy-pasted code nearby? → if yes: extract and reuse
// [ ] Are there comments explaining WHAT? → if yes: rename instead
// [ ] Does it mutate anything from outside? → if yes: refactor to pure

// Stubs
async function validateAndFetchOrder(id: string) { return { id }; }
async function checkInventoryAvailability(order: any) {}
async function chargePayment(order: any) { return {}; }
async function persistOrderCompletion(order: any, payment: any) {}
async function sendOrderConfirmation(order: any) {}
