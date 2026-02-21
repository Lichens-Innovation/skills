/**
 * API RESPONSE FORMAT
 * Rule: All API responses must follow the standard ApiResponse envelope.
 *       Always include success flag. Use meta for pagination.
 */

// ─────────────────────────────────────────────
// STANDARD RESPONSE ENVELOPE
// ─────────────────────────────────────────────

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

// ─────────────────────────────────────────────
// RESPONSE HELPERS
// ─────────────────────────────────────────────

// ✅ GOOD — typed helper functions for consistent responses
function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

function errorResponse(message: string): ApiResponse<never> {
  return { success: false, error: message };
}

function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─────────────────────────────────────────────
// ROUTE HANDLER EXAMPLES (Next.js / Express style)
// ─────────────────────────────────────────────

interface Market {
  id: string;
  name: string;
  status: "active" | "resolved" | "closed";
}

// ✅ GOOD — single item
async function getMarketHandler(marketId: string): Promise<ApiResponse<Market>> {
  try {
    const market = await findMarketById(marketId);

    if (!market) {
      return errorResponse(`Market ${marketId} not found`);
    }

    return successResponse(market);
  } catch (error) {
    console.error("getMarketHandler error:", error);
    return errorResponse("Internal server error");
  }
}

// ✅ GOOD — paginated list
async function listMarketsHandler(
  page = 1,
  limit = 20
): Promise<ApiResponse<Market[]>> {
  try {
    const { markets, total } = await fetchMarketsPaginated(page, limit);
    return paginatedResponse(markets, total, page, limit);
  } catch (error) {
    console.error("listMarketsHandler error:", error);
    return errorResponse("Failed to load markets");
  }
}

// ✅ GOOD — create with validation
async function createMarketHandler(body: unknown): Promise<ApiResponse<Market>> {
  try {
    const validated = validateCreateMarket(body);
    const market = await insertMarket(validated);
    return successResponse(market);
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(error.message);
    }
    console.error("createMarketHandler error:", error);
    return errorResponse("Failed to create market");
  }
}

// ─────────────────────────────────────────────
// HTTP STATUS CODE CONVENTIONS
// ─────────────────────────────────────────────

// 200 OK           → successful GET, PUT, PATCH
// 201 Created      → successful POST (resource created)
// 204 No Content   → successful DELETE (no body)
// 400 Bad Request  → validation error, malformed request
// 401 Unauthorized → not authenticated
// 403 Forbidden    → authenticated but not authorized
// 404 Not Found    → resource does not exist
// 409 Conflict     → duplicate resource, constraint violation
// 500 Server Error → unexpected error (never expose details to client)

// ─────────────────────────────────────────────
// CLIENT-SIDE CONSUMPTION PATTERN
// ─────────────────────────────────────────────

// ✅ GOOD — always check success before using data
async function loadMarket(id: string) {
  const response = await fetch(`/api/markets/${id}`).then(
    (r) => r.json() as Promise<ApiResponse<Market>>
  );

  if (!response.success || !response.data) {
    throw new Error(response.error ?? "Unknown error");
  }

  return response.data; // TypeScript knows this is Market
}

// ─────────────────────────────────────────────
// Stubs
// ─────────────────────────────────────────────

class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = "ValidationError"; }
}

async function findMarketById(id: string): Promise<Market | null> {
  return { id, name: "Example", status: "active" };
}

async function fetchMarketsPaginated(page: number, limit: number) {
  return { markets: [] as Market[], total: 0 };
}

async function insertMarket(data: unknown): Promise<Market> {
  return { id: "new", name: "New Market", status: "active" };
}

function validateCreateMarket(body: unknown) {
  return body;
}
