import test from "node:test";
import assert from "node:assert/strict";

import { buildTrackingUrl, getShippingOptions } from "./shippingService";

test("returns deterministic shipping quotes", async () => {
  const options = await getShippingOptions({
    city: "Ho Chi Minh City",
    district: "District 1",
    subtotal: 400,
  });

  assert.equal(options.length, 2);
  assert.equal(options[0].provider, "Nhận hàng trực tiếp tại kho");
  assert.equal(options[0].fee, 0);
  assert.equal(options[1].provider, "Shop vận chuyển");
  assert.ok(options[1].fee > options[0].fee);
});

test("builds carrier tracking urls", () => {
  assert.ok(buildTrackingUrl("GHN", "TRACK-001")?.includes("ghn"));
  assert.ok(buildTrackingUrl("J&T Express", "TRACK-002")?.includes("jtexpress"));
  assert.ok(buildTrackingUrl("VNPost", "TRACK-003")?.includes("vnpost"));
});
