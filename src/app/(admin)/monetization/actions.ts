"use server";

import { revalidatePath } from "next/cache";
import { monetizationApi } from "@/lib/kumbu-api/monetization";

function revalidateMonetization() {
  revalidatePath("/monetization");
  revalidatePath("/monetization/settings");
  revalidatePath("/monetization/products");
  revalidatePath("/monetization/categories");
}

export async function refreshMetricsAction() {
  await monetizationApi.refreshMetrics();
  revalidateMonetization();
}

export async function enableChargingAction() {
  await monetizationApi.enableCharging();
  revalidateMonetization();
}

export async function disableChargingAction() {
  await monetizationApi.disableCharging();
  revalidateMonetization();
}

export async function confirmPaymentAction(paymentId: string, note?: string) {
  await monetizationApi.confirmPayment(paymentId, note);
  revalidateMonetization();
}

export async function rejectPaymentAction(paymentId: string, reason: string) {
  await monetizationApi.rejectPayment(paymentId, reason);
  revalidateMonetization();
}

export async function updateMonetizationSettingsAction(input: Record<string, unknown>) {
  const updated = await monetizationApi.updateSettings(input);
  revalidateMonetization();
  return updated;
}

export async function updatePaymentProviderAction(
  providerId: string,
  input: Record<string, unknown>,
) {
  const updated = await monetizationApi.updatePaymentProvider(providerId, input);
  revalidateMonetization();
  return updated;
}

export async function updateMonetizationProductAction(
  productId: string,
  input: Record<string, unknown>,
) {
  const updated = await monetizationApi.updateProduct(productId, input);
  revalidateMonetization();
  return updated;
}

export async function updateCategoryStrategyAction(
  categoryId: string,
  input: Record<string, unknown>,
) {
  await monetizationApi.updateCategoryStrategy(categoryId, input);
  const matrix = await monetizationApi.categoryMatrix();
  revalidateMonetization();
  return matrix;
}
