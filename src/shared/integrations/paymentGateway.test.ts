import test from "node:test";
import assert from "node:assert/strict";

import { createPaymentSession, isOnlinePayment } from "./paymentGateway";

test("detects online payment methods", () => {
  assert.equal(isOnlinePayment("VNPAY"), true);
  assert.equal(isOnlinePayment("MOMO"), true);
  assert.equal(isOnlinePayment("BANK_TRANSFER"), true);
  assert.equal(isOnlinePayment("COD"), false);
});

test("creates a payment session with a redirect url", async () => {
  const session = await createPaymentSession({
    orderId: "ord_123",
    amount: 150000,
    method: "VNPAY",
  });

  assert.equal(session.providerName, "VNPAY");
  assert.ok(session.redirectUrl.includes("ord_123"));
  assert.ok(session.redirectUrl.includes("amount=150000"));
  assert.ok(session.expiresAt);
});
