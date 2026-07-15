import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Webhook da Cakto ainda não configurado.",
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Rota do webhook da Cakto online.",
  });
}