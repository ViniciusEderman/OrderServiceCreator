import { Result, AppError } from "@/shared/core/result";
import { expect } from "vitest";

export const expectSuccess = <T>(result: Result<T>): T => {
  expect(result.isSuccess).toBe(true);
  const value = result.getValue();
  expect(value).toBeDefined();

  return value;
};

export const expectFailure = (
  result: Result<any>,
  expectedError?: AppError
) => {
  expect(result.isSuccess).toBe(false);
  const error = result.getError();
  expect(error).toBeDefined();

  if (expectedError) {
    expect(error).toEqual(expectedError);
  }
  return error;
};

export const expectVoidSuccess = (result: Result<any>) => {
  expect(result.isSuccess).toBe(true);
};
