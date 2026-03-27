const { test } = require("node:test");
const assert = require("node:assert/strict");
const { formatResponse } = require("../src/utils/response");

test("formatResponse returns standard shape", () => {
  const res = formatResponse({ ok: true, data: { hello: "world" } });
  assert.equal(res.success, true);
  assert.deepEqual(res.data, { hello: "world" });
});
