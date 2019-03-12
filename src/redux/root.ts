import storage from 'redux-persist/lib/storage';
import getStoredState from 'redux-persist/lib/integration/getStoredStateMigrateV4';

import { ApplicationState } from './root';
import { LocationState, locationStateReducer } from './location';
import { CallState, callStateReducer } from './callState';
import { RemoteDataState, remoteDataReducer } from './remoteData';
import { UserStatsState, userStatsReducer } from './userStats';
import { UserState, userStateReducer } from './userState';
import { persistCombineReducers } from 'redux-persist';
import { defaultRemoteDataState } from './remoteData/reducer';
import { defaultUserStatsState } from './userStats/reducer';

export enum OutcomeType {
  UNAVAILABLE = 'unavailable',
  VOICEMAIL = 'voicemail',
  CONTACT = 'contact',
  SKIP = 'skip'
}

export interface ApplicationState {
  remoteDataState: RemoteDataState;
  callState: CallState;
  locationState: LocationState;
  userStatsState: UserStatsState;
  userState: UserState;
}

export const DefaultApplicationState: ApplicationState = {
  remoteDataState: defaultRemoteDataState,
  callState: {} as CallState,
  locationState: {} as LocationState,
  userStatsState: defaultUserStatsState,
  userState: {} as UserState
};

// DANGER: TypeScript magic ahead!!
// These articles should help your understanding of this section:
// https://blog.mariusschulz.com/2017/01/06/typescript-2-1-keyof-and-lookup-types
// https://blog.mariusschulz.com/2017/01/20/typescript-2-1-mapped-types
// https://moin.world/2017/06/18/10-TypeScript-Features-You-Might-Not-Know/
//
// This will be used by redux-persist in store.ts
// A type that is an ApplicationState key
export type ApplicationStateKeyType = keyof ApplicationState;
// A TS mapped type to type out an object shape that represents
// all ApplicationState keys and their string equivalents.
type ApplicationStateKeyTypes = {
  [K in ApplicationStateKeyType]: ApplicationStateKeyType
};
// Object that maps out all possible ApplicationState keys
export const ApplicationStateKey: ApplicationStateKeyTypes = {
  locationState: 'locationState',
  remoteDataState: 'remoteDataState',
  callState: 'callState',
  userStatsState: 'userStatsState',
  userState: 'userState'
};

const v4config = {
  whitelist: [
    ApplicationStateKey.locationState,
    ApplicationStateKey.userStatsState,
    ApplicationStateKey.userState,
    ApplicationStateKey.callState
  ]
};

const config = {
  key: 'fivecalls',
  debug: true,
  storage,
  whitelist: [
    ApplicationStateKey.locationState,
    ApplicationStateKey.userStatsState,
    ApplicationStateKey.userState,
    ApplicationStateKey.callState
  ],
  getStoredState: getStoredState(v4config)
};

const rootReducer = persistCombineReducers(config, {
  remoteDataState: remoteDataReducer,
  callState: callStateReducer,
  locationState: locationStateReducer,
  userStatsState: userStatsReducer,
  userState: userStateReducer
});

export default rootReducer;
