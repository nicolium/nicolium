import { Map as ImmutableMap } from 'immutable';

import plFeConfig from '@/__fixtures__/admin_api_frontend_config.json';
import plfe from '@/__fixtures__/pl-fe.json';
import { ADMIN_CONFIG_UPDATE_SUCCESS } from '@/actions/admin';
import * as actions from '@/actions/pl-fe';

import reducer from './pl-fe';

describe('pl-fe reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(ImmutableMap());
  });

  it('should handle PLFE_CONFIG_REQUEST_SUCCESS', () => {
    const state = ImmutableMap({ brandColor: '#354e91' });
    const action = {
      type: actions.PLFE_CONFIG_REQUEST_SUCCESS,
      plFeConfig: plfe,
    };
    expect(reducer(state, action).toJS()).toMatchObject({
      brandColor: '#254f92',
    });
  });

  // it('should handle PLFE_CONFIG_REQUEST_FAIL', () => {
  //   const state = ImmutableMap({ skipAlert: false, brandColor: '#354e91' });
  //   const action = {
  //     type: actions.PLFE_CONFIG_REQUEST_FAIL,
  //     skipAlert: true,
  //   };
  //   expect(reducer(state, action).toJS()).toMatchObject({
  //     skipAlert: true,
  //     brandColor: '#354e91',
  //   });
  // });

  it('should handle ADMIN_CONFIG_UPDATE_SUCCESS', () => {
    const state = ImmutableMap({ brandColor: '#354e91' });
    const action = {
      type: ADMIN_CONFIG_UPDATE_SUCCESS,
      configs: plFeConfig.configs,
    };
    expect(reducer(state, action).toJS()).toMatchObject({
      brandColor: '#254f92',
    });
  });

});
