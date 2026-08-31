/**
 * validate(schema, source) — parse req[source] with a zod schema, replace it with
 * the parsed value, and forward ZodErrors to the error handler.
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    next();
  };

export default validate;
