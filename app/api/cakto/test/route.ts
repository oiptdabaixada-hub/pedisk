import { NextResponse } from "next/server";

const CAKTO_API_BASE = "https://api.cakto.com.br";

type CaktoTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  detail?: string;
  error?: string;
  error_description?: string;
};

type PaginatedResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};

type CaktoProduct = {
  id: string;
  short_id?: string;
  name: string;
  status?: string;
  type?: string;
  price?: string | number;
};

type CaktoOffer = {
  id: string;
  name: string;
  price?: number;
  product?: string;
  status?: string;
  type?: string;
  default?: boolean;
  recurrence_period?: number;
  quantity_recurrences?: number;
  trial_days?: number;
  max_retries?: number;
  retry_interval?: number;
};

function safeErrorMessage(value: unknown) {
  if (value instanceof Error) return value.message;
  return "Erro desconhecido.";
}

async function requestCaktoToken(
  clientId: string,
  clientSecret: string
): Promise<CaktoTokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${CAKTO_API_BASE}/public_api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as CaktoTokenResponse;

  if (!response.ok || !data.access_token) {
    const reason =
      data.detail ||
      data.error_description ||
      data.error ||
      `A Cakto respondeu com status ${response.status}.`;

    throw new Error(`Falha ao autenticar na Cakto: ${reason}`);
  }

  return data;
}

async function caktoGet<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${CAKTO_API_BASE}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason =
      data?.detail ||
      data?.error ||
      `A Cakto respondeu com status ${response.status}.`;

    throw new Error(reason);
  }

  return data as T;
}

export async function GET() {
  try {
    const clientId = process.env.CAKTO_CLIENT_ID;
    const clientSecret = process.env.CAKTO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          step: "environment",
          message:
            "As variáveis CAKTO_CLIENT_ID e CAKTO_CLIENT_SECRET não foram encontradas.",
        },
        { status: 500 }
      );
    }

    const token = await requestCaktoToken(clientId, clientSecret);

    const productsResponse = await caktoGet<PaginatedResponse<CaktoProduct>>(
      "/public_api/products/?search=Pedisk&status=active&type=subscription&limit=20",
      token.access_token!
    );

    const products = productsResponse.results || [];

    const pediskProduct =
      products.find(
        (product) => product.name.trim().toLowerCase() === "pedisk"
      ) || products[0] || null;

    let offers: CaktoOffer[] = [];

    if (pediskProduct?.id) {
      const offersResponse = await caktoGet<PaginatedResponse<CaktoOffer>>(
        `/public_api/offers/?product=${encodeURIComponent(
          pediskProduct.id
        )}&status=active&type=subscription&limit=20`,
        token.access_token!
      );

      offers = offersResponse.results || [];
    }

    return NextResponse.json({
      success: true,
      authentication: {
        connected: true,
        tokenType: token.token_type || "Bearer",
        expiresInSeconds: token.expires_in || null,
        scopes: token.scope ? token.scope.split(" ") : [],
      },
      product: pediskProduct
        ? {
            id: pediskProduct.id,
            shortId: pediskProduct.short_id || null,
            name: pediskProduct.name,
            status: pediskProduct.status || null,
            type: pediskProduct.type || null,
            price: pediskProduct.price || null,
          }
        : null,
      offers: offers.map((offer) => ({
        id: offer.id,
        name: offer.name,
        price: offer.price ?? null,
        status: offer.status || null,
        type: offer.type || null,
        isDefault: Boolean(offer.default),
        recurrencePeriodDays: offer.recurrence_period ?? null,
        quantityRecurrences: offer.quantity_recurrences ?? null,
        trialDays: offer.trial_days ?? null,
        maxRetries: offer.max_retries ?? null,
        retryIntervalDays: offer.retry_interval ?? null,
      })),
      message: pediskProduct
        ? "Conexão com a Cakto funcionando e produto Pedisk encontrado."
        : "Conexão com a Cakto funcionando, mas o produto Pedisk não foi encontrado com os filtros atuais.",
    });
  } catch (error) {
    console.error("Erro no teste da Cakto:", error);

    return NextResponse.json(
      {
        success: false,
        step: "cakto-api",
        message: safeErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
