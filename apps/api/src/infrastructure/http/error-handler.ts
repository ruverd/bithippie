import { Elysia } from "elysia";
import { DomainError } from "../../shared/domain/errors";

export const errorHandler = new Elysia({ name: "error-handler" }).onError(({ error, set }) => {
  if (error instanceof DomainError) {
    set.status = error.status;
    return { error: error.code, message: error.message };
  }
  throw error;
});
