import { createClient } from "@supabase/supabase-js";
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
  results?: T[];
};

type CaktoProduct = {
  id: string;
  short_id?: string | null;
  name: string;
  status?: string | null;
  type?: string | null;
};

type CaktoOffer = {
  id: string;
  name: string;
  price?: number | string | null;
  product?: string | null;
  status?: string | null;
  type?: string | null;
  default?: boolean | null;
  recurrence_period?: number | null;
  quantity_recurrences?: number | null;
  trial_days?: number | null;
  max_retries?: number | null;
  retry_interval?: number | null;
};

function getServerEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const caktoClientId = process.env.CAKTO_CLIENT_ID;
  const caktoClientSecret = process.env.CAKTO_CLIENT_SECRET;

  const missing = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    !caktoClientId && "CAKTO_CLIENT_ID",
    !caktoClientSecret && "CAKTO_CLIENT_SECRET",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Variáveis ausentes no .env.local: ${missing.join(", ")}`
    );
  }

  return {
    supabaseUrl: supabaseUrl!,
    serviceRoleKey: serviceRoleKey!,
    caktoClientId: caktoClientId!,
    caktoClientSecret: caktoClientSecret!,
  };
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
      `HTTP ${response.status}`;

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
      data?.detail || data?.error || data?.message || `HTTP ${response.status}`;

    throw new Error(`Erro da Cakto em ${path}: ${reason}`);
  }

  return data as T;
}

function normalizePriceToCents(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;

  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(",", "."));

  if (!Number.isFinite(numeric)) return null;

  return Math.round(numeric * 100);
}

export async function POST() {
  try {
    // Esta rota serve para configuração interna.
    // Em produção, ela fica bloqueada para não poder ser acionada publicamente.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A sincronização manual está bloqueada em produção por segurança.",
        },
        { status: 403 }
      );
    }

    const {
      supabaseUrl,
      serviceRoleKey,
      caktoClientId,
      caktoClientSecret,
    } = getServerEnv();

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const token = await requestCaktoToken(
      caktoClientId,
      caktoClientSecret
    );

    const productsResponse = await caktoGet<
      PaginatedResponse<CaktoProduct>
    >(
      "/public_api/products/?search=Pedisk&status=active&limit=50",
      token.access_token!
    );

    const products = productsResponse.results || [];

    const product =
      products.find(
        (item) => item.name.trim().toLowerCase() === "pedisk"
      ) || products[0];

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          step: "product",
          message:
            "A conexão funcionou, mas nenhum produto Pedisk ativo foi encontrado na Cakto.",
        },
        { status: 404 }
      );
    }

    const offersResponse = await caktoGet<PaginatedResponse<CaktoOffer>>(
      `/public_api/offers/?product=${encodeURIComponent(
        product.id
      )}&status=active&type=subscription&limit=50`,
      token.access_token!
    );

    const offers = offersResponse.results || [];

    const offer =
      offers.find((item) => {
        const priceCents = normalizePriceToCents(item.price);

        return (
          item.type === "subscription" &&
          priceCents === 3990 &&
          (item.recurrence_period === 30 ||
            item.recurrence_period === null ||
            item.recurrence_period === undefined)
        );
      }) ||
      offers.find((item) => Boolean(item.default)) ||
      offers[0];

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          step: "offer",
          product: {
            id: product.id,
            name: product.name,
          },
          message:
            "Produto Pedisk encontrado, mas nenhuma oferta recorrente ativa foi localizada.",
        },
        { status: 404 }
      );
    }

    const offerPriceCents = normalizePriceToCents(offer.price);

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .update({
        cakto_product_id: product.id,
        cakto_offer_id: offer.id,
        price_cents: offerPriceCents ?? 3990,
        billing_interval: "monthly",
        updated_at: new Date().toISOString(),
      })
      .eq("code", "pro")
      .select(
        "id, code, name, price_cents, cakto_product_id, cakto_offer_id"
      )
      .single();

    if (planError) {
      throw new Error(
        `Falha ao salvar os IDs no Supabase: ${planError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Plano Pedisk Pro sincronizado com o produto e a oferta da Cakto.",
      authentication: {
        connected: true,
        tokenType: token.token_type || "Bearer",
        expiresInSeconds: token.expires_in || null,
        scopes: token.scope ? token.scope.split(" ") : [],
      },
      cakto: {
        product: {
          id: product.id,
          shortId: product.short_id || null,
          name: product.name,
          status: product.status || null,
          type: product.type || null,
        },
        offer: {
          id: offer.id,
          name: offer.name,
          priceCents: offerPriceCents,
          status: offer.status || null,
          type: offer.type || null,
          isDefault: Boolean(offer.default),
          recurrencePeriodDays: offer.recurrence_period ?? null,
          quantityRecurrences: offer.quantity_recurrences ?? null,
          trialDays: offer.trial_days ?? null,
          maxRetries: offer.max_retries ?? null,
          retryIntervalDays: offer.retry_interval ?? null,
        },
      },
      supabase: {
        plan,
      },
    });
  } catch (error) {
    console.error("Erro ao sincronizar Cakto com Supabase:", error);

    return NextResponse.json(
      {
        success: false,
        step: "sync",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado durante a sincronização.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Use uma requisição POST para executar a sincronização.",
    },
    { status: 405 }
  );
}
