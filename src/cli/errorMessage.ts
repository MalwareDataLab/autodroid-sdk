interface IValidationError {
  constraints?: Record<string, string>;
  children?: IValidationError[];
}

const findConstraintMessage = (
  errors: IValidationError[],
): string | undefined =>
  errors.reduce<string | undefined>(
    (foundMessage, error) =>
      foundMessage ??
      (error.constraints
        ? Object.values(error.constraints)[0]
        : findConstraintMessage(error.children ?? [])),
    undefined,
  );

const toErrorMessage = (error: unknown): string => {
  const validationErrors = (
    error as { graphQLErrors?: { extensions?: Record<string, unknown> }[] }
  ).graphQLErrors?.flatMap(
    graphQLError =>
      (graphQLError.extensions?.validationErrors as IValidationError[]) ?? [],
  );

  return (
    findConstraintMessage(validationErrors ?? []) ??
    (error instanceof Error ? error.message : String(error))
  );
};

export { toErrorMessage };
