import * as React from 'react';
import { Link } from 'react-router-dom';
import onClickOutside from 'react-onclickoutside';

import { CustomLogin, LoginService } from '@5calls/react-components';
import { store } from '../../redux/store';
import { UserState, UserProfile } from '../../redux/userState/reducer';
import {
  clearProfileActionCreator,
  setProfileActionCreator,
  setAuthTokenActionCreator
} from '../../redux/userState/action';
import { Auth0Config } from '../../common/constants';
import { postEmail } from '../../services/apiServices';
import { eventContext } from '../../contexts/EventContext';
import HeadMeta from '../shared/HeadMeta';
import { Issue } from '../../common/models';
import { Mixpanel } from '../../services/mixpanel';

interface Props {
  readonly postcards?: boolean;
  readonly currentUser?: UserState;
  readonly currentIssue?: Issue;
  readonly issues: Issue[];
}

interface State {
  readonly userMenuHidden: boolean;
  readonly currentUser?: UserState;
}

class HeaderImpl extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      userMenuHidden: true
    };
  }

  componentDidMount() {
    if (this.props.currentUser && this.props.currentUser.profile) {
      Mixpanel.identify(this.props.currentUser.profile.sub);
    }
  }

  handleClickOutside = () => {
    if (!this.state.userMenuHidden) {
      this.toggleMenu();
    }
  };

  toggleMenu = () => {
    this.setState({ userMenuHidden: !this.state.userMenuHidden });
  };

  logout = () => {
    store.dispatch(clearProfileActionCreator());
  };

  refresh = (email: string, subscribe: boolean) => {
    let idToken = '';
    if (this.props.currentUser && this.props.currentUser.idToken) {
      idToken = this.props.currentUser.idToken;
    }

    // send email, then refresh
    postEmail(email, subscribe, idToken)
      .then(() => {
        let login = new LoginService(Auth0Config);

        if (
          this.props.currentUser &&
          this.props.currentUser.profile &&
          this.props.currentUser.idToken
        ) {
          login
            .checkAndRenewSession(
              this.props.currentUser.profile,
              this.props.currentUser.idToken,
              true
            )
            .then(authResponse => {
              // Set the updated profile ourselves - auth is a component that doesn't know about redux
              store.dispatch(setAuthTokenActionCreator(authResponse.authToken));
              store.dispatch(setProfileActionCreator(authResponse.userProfile));
            })
            .catch(error => {
              // clear the session
              store.dispatch(clearProfileActionCreator());
            });
        }
      })
      .catch(error => {
        // console.error("got an error updating email");
      });
  };

  render() {
    let profile: UserProfile | undefined;
    if (this.props.currentUser !== undefined) {
      profile = this.props.currentUser.profile;
    }

    return (
      <>
        <HeadMeta issue={this.props.currentIssue} />
        <header className="logo__header" role="banner">
          <div className="layout">
            <Link to="/">
              <img
                src="/img/5calls-logo-small.png"
                alt="5 Calls"
                className="logo__img"
              />
            </Link>
            <div className="header__right">
              {/* keep this around for teams / campaigns, but don't show for now */}
              {/* <ul>
              <li><Link className={props.postcards ? '' : 'active'} to="/">Calls</Link></li>
              <li><Link className={props.postcards ? 'active' : ''} to="/postcards">Postcards</Link></li>
            </ul> */}
              <a
                href="https://secure.actblue.com/donate/5calls-donate?amount=25"
                className="btn btn-primary donate-btn"
              >
                Donate
              </a>
              <eventContext.Consumer>
                {eventManager => (
                  <CustomLogin
                    auth0Config={Auth0Config}
                    userProfile={profile}
                    eventEmitter={eventManager.ee}
                    logoutHandler={this.logout}
                    refreshHandler={this.refresh}
                  />
                )}
              </eventContext.Consumer>
            </div>
          </div>
        </header>
      </>
    );
  }
}

export let Header = onClickOutside(HeaderImpl);
