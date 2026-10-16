// Operation import
import { defineOperation } from './defineOperation';

const healthOperation = (params: {
  name: string;
  field: string;
  command: string;
  description: string;
  run: Parameters<typeof defineOperation>[0]['run'];
}) =>
  defineOperation({
    name: params.name,
    field: params.field,
    command: ['health', params.command],
    description: params.description,
    access: 'user',
    effect: 'read',
    input: {},
    run: params.run,
    project: checkedAt => ({ checked_at: checkedAt }),
    output: ['checked_at'],
  });

const healthOperations = [
  healthOperation({
    name: 'health_check',
    field: 'healthCheck',
    command: 'check',
    description: 'Check that the AutoDroid API answers (returns its clock).',
    run: sdk => sdk.healthCheck.healthCheck({}),
  }),
  healthOperation({
    name: 'health_liveness',
    field: 'healthLivenessCheck',
    command: 'liveness',
    description: 'Check that the AutoDroid API process is alive.',
    run: sdk => sdk.healthCheck.livenessCheck({}),
  }),
  healthOperation({
    name: 'health_readiness',
    field: 'healthReadinessCheck',
    command: 'readiness',
    description:
      'Check that the AutoDroid API and the services it depends on are ready.',
    run: sdk => sdk.healthCheck.readinessCheck({}),
  }),
];

export { healthOperations };
