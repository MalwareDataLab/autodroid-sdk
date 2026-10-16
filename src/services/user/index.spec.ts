// Util import
import { describePassthrough } from '../../../test/support/passthrough';

// Service import
import {
  SESSION_QUERY,
  USER_MCP_AUTHORIZATION_GRANT_REVOKE_MUTATION,
  USER_MCP_AUTHORIZATION_GRANTS_QUERY,
  USER_QUERY,
  USER_SESSIONS_CLOSE_MUTATION,
  USER_UPDATE_DATA_MUTATION,
  USER_UPDATE_LEARNING_DATA_MUTATION,
} from '@services/user/queries';

// Target import
import { User } from '@services/user';

describePassthrough('User service', context => new User(context), [
  {
    method: 'getCurrent',
    kind: 'query',
    document: USER_QUERY,
    rootField: 'user',
    noVariables: true,
  },
  {
    method: 'getCurrentSession',
    kind: 'query',
    document: SESSION_QUERY,
    rootField: 'session',
    noVariables: true,
  },
  {
    method: 'update',
    kind: 'mutate',
    document: USER_UPDATE_DATA_MUTATION,
    rootField: 'userUpdateData',
  },
  {
    method: 'updateLearningData',
    kind: 'mutate',
    document: USER_UPDATE_LEARNING_DATA_MUTATION,
    rootField: 'userUpdateLearningData',
  },
  {
    method: 'getMcpAuthorizationGrants',
    kind: 'query',
    document: USER_MCP_AUTHORIZATION_GRANTS_QUERY,
    rootField: 'userMcpAuthorizationGrants',
    noVariables: true,
  },
  {
    method: 'revokeMcpAuthorizationGrant',
    kind: 'mutate',
    document: USER_MCP_AUTHORIZATION_GRANT_REVOKE_MUTATION,
    rootField: 'userMcpAuthorizationGrantRevoke',
  },
  {
    method: 'closeSessions',
    kind: 'mutate',
    document: USER_SESSIONS_CLOSE_MUTATION,
    rootField: 'userSessionsClose',
  },
]);
