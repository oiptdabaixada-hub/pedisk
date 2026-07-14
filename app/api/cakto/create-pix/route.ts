import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const CAKTO_API_BASE = "https://api.cakto.com.br";

type CheckoutBody = {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  documentType?: "cpf" | "cnpj";
  fingerprint?: string;
  antifraudProfilingAttemptReference?: string;
};

type CaktoTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  detail?: string;
  error?: string;
  error_description?: string;
};

type CaktoPixResponse = {
  id?: string;
  refId?: string;
  status?: string;
  paymentMethod?: string;
  amount?: string;
  baseAmount?: string;
  discount?: string;
  fees?: string;
  externalId?: string;
  checkoutUrl?: string;
  createdAt?: string;
  product?: {
    id?: string;
    short_id?: string;
    name?: string;
  };
  offer?: {
    id?: string;
    name?: string;
    price?: number;
  };
  pix?: {
    qrCode?: string;
    qrCodeBase64?: string;
    expiresAt?: string;
    expirationDate?: string;
  };
  detail?: string;
  error?: string;
  message?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizePhone(value: string) {
  const digits = onlyDigits(value);

  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function getCaktoErrorMessage(
  payload: Record<string, unknown>,
  fallback: string
) {
  const direct =
    payload.detail ||
    payload.message ||
    payload.error;

  if (typeof direct === "string" && direct.trim()) {
    return direct;
  }

  const fieldErrors = Object.entries(payload)
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `${field}: ${String(item)}`);
      }

      if (typeof value === "string") {
        return [`${field}: ${value}`];
      }

      return [];
    })
    .filter(Boolean);

  return fieldErrors.length > 0 ? fieldErrors.join(" | ") : fallback;
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }

    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  );
}

function getEnv() {
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
    throw new Error(`Variáveis ausentes: ${missing.join(", ")}`);
  }

  return {
    supabaseUrl: supabaseUrl!,
    serviceRoleKey: serviceRoleKey!,
    caktoClientId: caktoClientId!,
    caktoClientSecret: caktoClientSecret!,
  };
}

async function getCaktoToken(clientId: string, clientSecret: string) {
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
    throw new Error(
      data.detail ||
        data.error_description ||
        data.error ||
        `Falha na autenticação da Cakto: HTTP ${response.status}`
    );
  }

  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const {
      supabaseUrl,
      serviceRoleKey,
      caktoClientId,
      caktoClientSecret,
    } = getEnv();

    const authorization = request.headers.get("authorization");
    const userAccessToken = authorization?.replace(/^Bearer\s+/i, "").trim();

    if (!userAccessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Você precisa estar conectado para assinar a Pedisk.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(userAccessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sua sessão expirou. Entre novamente na Pedisk.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as CheckoutBody;

    const name = body.name?.trim() || "";
    const email = body.email?.trim().toLowerCase() || user.email || "";
    const phone = normalizePhone(body.phone || "");
    const document = onlyDigits(body.document || "");
    const documentType =
      body.documentType || (document.length === 14 ? "cnpj" : "cpf");
    const fingerprint = body.fingerprint?.trim() || "";
    const antifraudReference =
      body.antifraudProfilingAttemptReference?.trim() || "";

    if (name.length < 3) {
      return NextResponse.json(
        { success: false, message: "Digite seu nome completo." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Digite um e-mail válido." },
        { status: 400 }
      );
    }

    if (phone.length < 12 || phone.length > 13) {
      return NextResponse.json(
        {
          success: false,
          message: "Digite um WhatsApp válido com DDD.",
        },
        { status: 400 }
      );
    }

    if (documentType === "cpf" && !isValidCpf(document)) {
      return NextResponse.json(
        { success: false, message: "Digite um CPF válido." },
        { status: 400 }
      );
    }

    if (documentType === "cnpj" && document.length !== 14) {
      return NextResponse.json(
        { success: false, message: "Digite um CNPJ válido." },
        { status: 400 }
      );
    }

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          message: "Não foi possível identificar esta sessão de pagamento.",
        },
        { status: 400 }
      );
    }

    if (!antifraudReference) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A análise antifraude ainda não foi concluída. Aguarde e tente novamente.",
        },
        { status: 400 }
      );
    }

    const { data: store, error: storeError } = await supabaseAdmin
      .from("stores")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (storeError || !store) {
      return NextResponse.json(
        {
          success: false,
          message: "Não encontramos a loja vinculada à sua conta.",
        },
        { status: 404 }
      );
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select(
        "id, code, name, price_cents, cakto_product_id, cakto_offer_id, active"
      )
      .eq("code", "pro")
      .eq("active", true)
      .maybeSingle();

    if (planError || !plan) {
      return NextResponse.json(
        {
          success: false,
          message: "O plano Pedisk Pro não está disponível neste momento.",
        },
        { status: 404 }
      );
    }

    if (!plan.cakto_product_id || !plan.cakto_offer_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "O plano ainda não foi sincronizado com a Cakto. Execute a sincronização primeiro.",
        },
        { status: 409 }
      );
    }

    const { data: currentSubscription, error: currentSubscriptionError } =
      await supabaseAdmin
        .from("subscriptions")
        .select(
          "id, status, cakto_order_id, amount_cents, metadata, created_at"
        )
        .eq("store_id", store.id)
        .in("status", ["pending", "trialing", "active", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (currentSubscriptionError) {
      throw new Error(
        `Falha ao consultar a assinatura atual: ${currentSubscriptionError.message}`
      );
    }

    if (
      currentSubscription?.status === "active" ||
      currentSubscription?.status === "trialing"
    ) {
      return NextResponse.json(
        {
          success: false,
          alreadySubscribed: true,
          message: "Sua loja já possui uma assinatura ativa da Pedisk.",
        },
        { status: 409 }
      );
    }

    if (currentSubscription?.id) {
      const { data: existingPayment } = await supabaseAdmin
        .from("subscription_payments")
        .select("raw_payload, created_at")
        .eq("subscription_id", currentSubscription.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const rawPayment = existingPayment?.raw_payload as
        | CaktoPixResponse
        | null
        | undefined;

      const rawExpiresAt =
        rawPayment?.pix?.expiresAt ||
        rawPayment?.pix?.expirationDate ||
        null;

      const existingPixIsValid =
        Boolean(rawPayment?.id && rawPayment?.pix?.qrCode) &&
        (!rawExpiresAt ||
          new Date(rawExpiresAt).getTime() > Date.now() + 30_000);

      if (existingPixIsValid && rawPayment) {
        return NextResponse.json(
          {
            success: true,
            reused: true,
            message:
              "Já existia um Pix pendente para esta loja. A cobrança anterior foi reutilizada.",
            payment: {
              orderId: rawPayment.id!,
              refId: rawPayment.refId || null,
              status: rawPayment.status || "waiting_payment",
              amount: rawPayment.amount || "39.90",
              baseAmount:
                rawPayment.baseAmount ||
                rawPayment.offer?.price?.toString() ||
                "39.90",
              fees: rawPayment.fees || "0",
              discount: rawPayment.discount || "0",
              checkoutUrl: rawPayment.checkoutUrl || null,
              qrCode: rawPayment.pix!.qrCode!,
              qrCodeBase64: rawPayment.pix!.qrCodeBase64 || null,
              expiresAt: rawExpiresAt,
            },
          },
          { status: 200 }
        );
      }
    }

    const idempotencyKey = randomUUID();
    const accessToken = await getCaktoToken(
      caktoClientId,
      caktoClientSecret
    );

    const payload = {
      paymentMethod: "pix",
      customer: {
        name,
        email,
        phone,
        fingerprint,
        docType: documentType,
        docNumber: document,
      },
      items: [
        {
          offerId: plan.cakto_offer_id,
          quantity: 1,
          offerType: "main",
        },
      ],
      pixExpiresIn: 3600,
    };

    const caktoResponse = await fetch(
      `${CAKTO_API_BASE}/public_api/payments/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const payment = (await caktoResponse
      .json()
      .catch(() => ({}))) as CaktoPixResponse;

    if (!caktoResponse.ok || !payment.id || !payment.pix?.qrCode) {
      console.error("Erro Cakto ao gerar Pix:", payment);

      const caktoMessage = getCaktoErrorMessage(
        payment as Record<string, unknown>,
        "A Cakto não conseguiu gerar a cobrança Pix."
      );

      return NextResponse.json(
        {
          success: false,
          message: caktoMessage,
          caktoStatus: caktoResponse.status,
        },
        { status: caktoResponse.status >= 400 ? caktoResponse.status : 502 }
      );
    }

    const amountCents = Math.round(Number(payment.amount || "0") * 100);

    const subscriptionPayload = {
      user_id: user.id,
      store_id: store.id,
      plan_id: plan.id,
      provider: "cakto",
      status: "pending",
      cakto_order_id: payment.id,
      cakto_product_id:
        payment.product?.id || plan.cakto_product_id,
      cakto_offer_id: payment.offer?.id || plan.cakto_offer_id,
      payment_method: "pix",
      amount_cents: amountCents || plan.price_cents,
      currency: "BRL",
      last_payment_status: "pending",
      last_event_type: "pix_created",
      last_event_at: new Date().toISOString(),
      metadata: {
        cakto_ref_id: payment.refId || null,
        cakto_checkout_url: payment.checkoutUrl || null,
        pix_expires_at:
          payment.pix.expiresAt ||
          payment.pix.expirationDate ||
          null,
        idempotency_key: idempotencyKey,
      },
    };

    let subscription: { id: string } | null = null;

    if (currentSubscription?.id) {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .update(subscriptionPayload)
        .eq("id", currentSubscription.id)
        .select("id")
        .single();

      if (error) {
        console.error(
          "Pix criado, mas falhou ao atualizar assinatura:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            paymentCreated: true,
            message:
              "O Pix foi criado, mas houve uma falha ao atualizar a assinatura. Não gere outra cobrança.",
            supportCode: payment.refId || payment.id,
          },
          { status: 500 }
        );
      }

      subscription = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .insert(subscriptionPayload)
        .select("id")
        .single();

      if (error) {
        console.error(
          "Pix criado, mas falhou ao criar assinatura:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            paymentCreated: true,
            message:
              "O Pix foi criado, mas houve uma falha ao registrar a assinatura. Não gere outra cobrança.",
            supportCode: payment.refId || payment.id,
          },
          { status: 500 }
        );
      }

      subscription = data;
    }

    const { error: paymentError } = await supabaseAdmin
      .from("subscription_payments")
      .insert({
        subscription_id: subscription!.id,
        user_id: user.id,
        store_id: store.id,
        provider: "cakto",
        cakto_order_id: payment.id,
        cakto_payment_id: payment.externalId || null,
        status: "pending",
        method: "pix",
        amount_cents: amountCents || plan.price_cents,
        currency: "BRL",
        raw_payload: payment,
      });

    if (paymentError && paymentError.code !== "23505") {
      console.error("Falha ao registrar pagamento Pix:", paymentError);
    }

    return NextResponse.json(
      {
        success: true,
        payment: {
          orderId: payment.id,
          refId: payment.refId || null,
          status: payment.status || "waiting_payment",
          amount: payment.amount || "39.90",
          baseAmount: payment.baseAmount || payment.offer?.price?.toString() || "39.90",
          fees: payment.fees || "0",
          discount: payment.discount || "0",
          checkoutUrl: payment.checkoutUrl || null,
          qrCode: payment.pix.qrCode,
          qrCodeBase64: payment.pix.qrCodeBase64 || null,
          expiresAt:
            payment.pix.expiresAt ||
            payment.pix.expirationDate ||
            null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro interno ao criar Pix:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao gerar cobrança Pix.",
      },
      { status: 500 }
    );
  }
}
