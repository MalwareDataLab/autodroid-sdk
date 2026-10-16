import { ApolloError } from '@apollo/client/core';
import { describe, expect, it } from 'vitest';

// Target import
import { toErrorMessage } from './errorMessage';

const argumentValidationError = (validationErrors: unknown[]) =>
  new ApolloError({
    graphQLErrors: [
      {
        message: 'Argument Validation Error',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED', validationErrors },
      },
    ],
  });

describe('CLI: toErrorMessage', () => {
  it("should show the API's constraint message instead of the generic validation error", () => {
    const error = argumentValidationError([
      {
        property: 'phone_number',
        constraints: {
          isPhoneNumber: 'phone_number must be a valid phone number',
        },
      },
    ]);

    expect(toErrorMessage(error)).toBe(
      'phone_number must be a valid phone number',
    );
  });

  it('should find the first constraint of a nested input, depth first', () => {
    const error = argumentValidationError([
      { property: 'data', children: [] },
      {
        property: 'configuration',
        children: [
          {
            property: 'parameters',
            children: [
              {
                property: 'name',
                constraints: {
                  isNotEmpty: 'name should not be empty',
                  isString: 'name must be a string',
                },
              },
            ],
          },
        ],
      },
      {
        property: 'tags',
        constraints: { isString: 'tags must be a string' },
      },
    ]);

    expect(toErrorMessage(error)).toBe('name should not be empty');
  });

  it('should keep the message when the validation errors carry no constraint', () => {
    const error = argumentValidationError([{ property: 'data' }]);

    expect(toErrorMessage(error)).toBe('Argument Validation Error');
  });

  it('should keep the message of any other API error', () => {
    const error = new ApolloError({
      graphQLErrors: [
        {
          message: 'Dataset not found.',
          extensions: { code: '@user_dataset_show_service/DATASET_NOT_FOUND' },
        },
      ],
    });

    expect(toErrorMessage(error)).toBe('Dataset not found.');
  });

  it('should keep the message of an error that did not come from the API', () => {
    expect(toErrorMessage(new Error('Invalid --data, expected JSON.'))).toBe(
      'Invalid --data, expected JSON.',
    );
  });

  it('should report a thrown value that is not an Error as its text', () => {
    expect(toErrorMessage('Session store is locked.')).toBe(
      'Session store is locked.',
    );
  });
});
