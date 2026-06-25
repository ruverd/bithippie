-- Enforce that exactly one typed value column is populated per measurement.
-- The "matches the definition's valueType" rule needs a cross-table lookup and
-- lives in the application layer; this static, in-row guard is the DB backstop.
ALTER TABLE "measurements"
  ADD CONSTRAINT "measurements_exactly_one_value"
  CHECK (num_nonnulls("numeric_value", "categorical_value", "text_value") = 1);

COMMENT ON TABLE "measurements" IS 'Recorded data points. Exactly one of numeric_value/categorical_value/text_value is populated (CHECK + app layer).';
COMMENT ON COLUMN "measurements"."numeric_value" IS 'Populated when the definition valueType = NUMERIC.';
COMMENT ON COLUMN "measurements"."categorical_value" IS 'Populated when valueType = CATEGORICAL; must be in definition.allowed_categories (enforced in app layer).';
COMMENT ON COLUMN "measurements"."text_value" IS 'Populated when valueType = TEXT.';
COMMENT ON TABLE "measurement_definitions" IS 'Describes a kind of measurement; new kinds are rows here, not schema changes.';
