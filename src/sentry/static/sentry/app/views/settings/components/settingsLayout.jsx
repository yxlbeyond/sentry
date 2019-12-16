import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import space from 'app/styles/space';
import {slideInLeft, fadeIn} from 'app/styles/animations';
import Button from 'app/components/button';
import SettingsBreadcrumb from './settingsBreadcrumb';
import SettingsHeader from './settingsHeader';
import SettingsSearch from './settingsSearch';

class SettingsLayout extends React.Component {
  static propTypes = {
    renderNavigation: PropTypes.func,
    route: PropTypes.object,
    router: PropTypes.object,
    routes: PropTypes.array,
  };

  state = {
    navVisible: false,
  };

  componentWillMount() {
    this.unlisten = this.props.router.listen(() => {
      this.toggleNav(false);
    });
  }
  componentWillUnmount() {
    this.unlisten();
  }

  toggleNav(navVisible) {
    this.setState({navVisible});
    if (navVisible) {
      document.getElementsByTagName('body')[0].classList.add('modal-open');
    } else {
      document.getElementsByTagName('body')[0].classList.remove('modal-open');
    }
  }

  render() {
    const {params, routes, route, router, renderNavigation, children} = this.props;
    // We want child's view's props
    const childProps = (children && children.props) || this.props;
    const childRoutes = childProps.routes || routes || [];
    const childRoute = childProps.route || route || {};

    return (
      <React.Fragment>
        <SettingsColumn>
          <SettingsHeader>
            <StyledBreadcrumbWrapper>
              <SettingsHamburgerIcon
                priority="link"
                iconSize="16px"
                icon={this.state.navVisible ? 'icon-close' : 'icon-activity'}
                onClick={() => this.toggleNav(!this.state.navVisible)}
              />
              <SettingsBreadcrumb
                params={params}
                routes={childRoutes}
                route={childRoute}
              />
            </StyledBreadcrumbWrapper>
            <SettingsSearch routes={routes} router={router} params={params} />
          </SettingsHeader>
          <MaxWidthContainer>
            {typeof renderNavigation === 'function' && (
              <SidebarWrapper isVisible={this.state.navVisible}>
                {renderNavigation()}
              </SidebarWrapper>
            )}
            <NavMask isVisible={this.state.navVisible} />
            <Content>{children}</Content>
          </MaxWidthContainer>
        </SettingsColumn>
      </React.Fragment>
    );
  }
}

const NavMask = styled('div')`
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: ${p => (p.isVisible ? 'block' : 'none')};
    background: rgba(0, 0, 0, 0.35);
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 2;
    animation: ${fadeIn} 250ms ease-in-out;
  }
`;

const StyledBreadcrumbWrapper = styled('div')`
  display: flex;
`;

const SettingsHamburgerIcon = styled(Button)`
  margin-right: ${space(2)};
  color: ${p => p.theme.gray5};
  display: none;
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    display: ${p => (p.isVisible ? 'none' : 'block')};
  }
`;

const MaxWidthContainer = styled('div')`
  display: flex;
  max-width: ${p => p.theme.settings.containerWidth};
  min-width: 600px; /* for small screen sizes, we need a min width to make it semi digestible */
  flex: 1;
`;

const SidebarWrapper = styled('div')`
  width: ${p => p.theme.settings.sidebarWidth};
  background: #fff;
  border-right: 1px solid ${p => p.theme.borderLight};
  padding: ${space(4)};
  @media (max-width: ${p => p.theme.breakpoints[0]}) {
    animation: ${slideInLeft} 100ms ease-in-out;
    display: ${p => (p.isVisible ? 'block' : 'none')};
    position: absolute;
    z-index: 3;
    height: 100%;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`;

const SettingsColumn = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1; /* so this stretches vertically so that footer is fixed at bottom */
  min-width: 0; /* fixes problem when child content stretches beyond layout width */
  footer {
    margin-top: 0;
  }
`;

/**
 * Note: `overflow: hidden` will cause some buttons in `SettingsPageHeader` to be cut off because it has negative margin.
 * Will also cut off tooltips.
 */

const Content = styled('div')`
  flex: 1;
  padding: ${space(4)};
  min-width: 0; /* keep children from stretching container */
`;

export default SettingsLayout;
