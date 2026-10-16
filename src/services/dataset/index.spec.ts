// Util import
import { describePassthrough } from '../../../test/support/passthrough';

// Service import
import {
  USER_DATASET_CREATE_MUTATION,
  USER_DATASET_DELETE_MUTATION,
  USER_DATASET_GET_MANY_QUERY,
  USER_DATASET_GET_ONE_QUERY,
  USER_DATASET_REQUEST_PUBLICATION_MUTATION,
  USER_DATASET_UPDATE_MUTATION,
} from '@services/dataset/queries';

// Target import
import { Dataset } from '@services/dataset';

describePassthrough('Dataset service', context => new Dataset(context), [
  {
    method: 'getOne',
    kind: 'query',
    document: USER_DATASET_GET_ONE_QUERY,
    rootField: 'userDataset',
  },
  {
    method: 'getMany',
    kind: 'query',
    document: USER_DATASET_GET_MANY_QUERY,
    rootField: 'userDatasets',
  },
  {
    method: 'create',
    kind: 'mutate',
    document: USER_DATASET_CREATE_MUTATION,
    rootField: 'userDatasetCreate',
  },
  {
    method: 'update',
    kind: 'mutate',
    document: USER_DATASET_UPDATE_MUTATION,
    rootField: 'userDatasetUpdate',
  },
  {
    method: 'requestPublication',
    kind: 'mutate',
    document: USER_DATASET_REQUEST_PUBLICATION_MUTATION,
    rootField: 'userDatasetRequestPublication',
  },
  {
    method: 'delete',
    kind: 'mutate',
    document: USER_DATASET_DELETE_MUTATION,
    rootField: 'userDatasetDelete',
  },
]);
