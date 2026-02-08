import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import {
  PanoramaFishEye,
  Map as MapIcon,
  ViewModule,
  LibraryBooks,
  School,
  Article,
  Assignment,
  WorkspacePremium,
} from '@mui/icons-material';
import styled from 'styled-components';

const ICON_MAP = {
  Map: MapIcon,
  ViewModule: ViewModule,
  LibraryBooks: LibraryBooks,
  School: School,
  Article: Article,
  Assignment: Assignment,
  WorkspacePremium: WorkspacePremium,
  Default: PanoramaFishEye,
};

// Fallback components in case they are not provided via config.components
const DefaultContainer = ({ children, className }) => <div className={className}>{children}</div>;
const DefaultTitle = ({ children, className }) => <div className={className}>{children}</div>;
const DefaultList = ({ children, className }) => <ul className={className}>{children}</ul>;
const DefaultItem = ({ children, className }) => <li className={className}>{children}</li>;
const DefaultItemLink = ({ children, to, className }) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);
const DefaultIconWrapper = ({ children, $bgColor, $color }) => (
  <div
    style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: $bgColor || '#f5f5f5',
      color: $color || '#757575',
      marginRight: '1rem',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);
const DefaultContentWrapper = ({ children }) => (
  <div style={{ overflow: 'hidden' }}>{children}</div>
);
const DefaultStyledTitleSpan = ({ children, className }) => (
  <span className={className}>{children}</span>
);
const DefaultItemSubtitle = ({ children, className }) => (
  <span className={className}>{children}</span>
);
const DefaultEmptyContainer = ({ children, className }) => (
  <div className={className}>{children}</div>
);
const DefaultEmptyLink = ({ children, to, className }) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);

const RecentActivityList = ({ config }) => {
  const location = useLocation();
  const {
    storageKey,
    maxItems = 3,
    globalRoots = ['dashboard', 'institutions', 'institution', 'settings'],
    titles = {
      header: 'Recent',
      emptyScoped: 'Go to Dashboard',
    },
    routes = {
      scopedDashboard: (scopeKey) => `/${scopeKey}/dashboard`,
    },
    showItemIcon = true,
    components = {},
  } = config;

  const { classNames = {} } = config;

  // Use provided components or default fallbacks
  const Container = components.Container || DefaultContainer;
  const Title = components.Title || DefaultTitle;
  const List = components.List || DefaultList;
  const Item = components.Item || DefaultItem;
  const ItemLink = components.ItemLink || DefaultItemLink;
  const IconWrapper = components.IconWrapper || DefaultIconWrapper;
  const ContentWrapper = components.ContentWrapper || DefaultContentWrapper;
  const StyledTitleSpan = components.StyledTitleSpan || DefaultStyledTitleSpan;
  const ItemSubtitle = components.ItemSubtitle || DefaultItemSubtitle;
  const EmptyContainer = components.EmptyContainer || DefaultEmptyContainer;
  const EmptyLink = components.EmptyLink || DefaultEmptyLink;

  const [activities, setActivities] = useState([]);

  // 1. Determine Scope and Context (Derived from props and URL)
  const passedScope = config.scope;
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || '';

  // If a scope is explicitly passed (e.g. institution UUID), use it. Otherwise, use URL-derived scope.
  const determinedKey = passedScope || firstSegment;
  const isGlobal = globalRoots.includes(determinedKey) || globalRoots.includes(firstSegment);

  useEffect(() => {
    const loadActivities = () => {
      try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          let parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData)) {
            const filtered = parsedData.filter((item) => {
              if (isGlobal) {
                // In global mode, show everything.
                return true;
              } else {
                // In scoped mode, match the specific scope.
                const scopeMatch = item.scopeKey === determinedKey;
                const routeSafe =
                  item.route &&
                  (item.route.startsWith(`/${determinedKey}/`) ||
                    item.route === `/${determinedKey}`);
                // We show it if it matches the scope AND (is on a valid route OR we have an explicit scope passed)
                return scopeMatch && (routeSafe || !!passedScope);
              }
            });

            filtered.sort((a, b) => b.updatedAt - a.updatedAt);
            setActivities(filtered.slice(0, maxItems));
          }
        }
      } catch (error) {
        console.error('Error reading recent activity', error);
      }
    };

    loadActivities();

    const handleStorageUpdate = (event) => {
      if (event.detail && event.detail.storageKey === storageKey) {
        loadActivities();
      }
    };

    const handleCrossTabUpdate = (e) => {
      if (e.key === storageKey) {
        loadActivities();
      }
    };

    window.addEventListener('recentActivityUpdated', handleStorageUpdate);
    window.addEventListener('storage', handleCrossTabUpdate);

    return () => {
      window.removeEventListener('recentActivityUpdated', handleStorageUpdate);
      window.removeEventListener('storage', handleCrossTabUpdate);
    };
  }, [
    storageKey,
    maxItems,
    JSON.stringify(globalRoots),
    location.pathname,
    passedScope,
    determinedKey,
    isGlobal,
  ]);

  if (!isGlobal && activities.length === 0) {
    return (
      <EmptyContainer
        className={
          classNames.emptyContainer ||
          (components.EmptyContainer ? '' : 'recent-activity-list recent-activity-empty')
        }
      >
        <Title className={classNames.title || (components.Title ? '' : 'menu-title')}>
          {titles.header || 'Recent'}
        </Title>
        <EmptyLink
          to={routes.scopedDashboard(determinedKey)}
          className={classNames.emptyLink || (components.EmptyLink ? '' : 'text-primary')}
        >
          {titles.emptyScoped}
        </EmptyLink>
      </EmptyContainer>
    );
  }

  if (isGlobal && activities.length === 0) {
    return null;
  }

  return (
    <Container
      className={classNames.container || (components.Container ? '' : 'RecentActivityList')}
    >
      <Title className={classNames.title || (components.Title ? '' : 'menu-title')}>
        {titles.header || 'Recent'}
      </Title>
      <List className={classNames.list || (components.List ? '' : 'list-unstyled')}>
        {activities.map((activity, index) => {
          const IconComponent = ICON_MAP[activity.icon] || ICON_MAP.Default;

          return (
            <Item
              key={`${activity.scopeKey}-${activity.entityId}-${index}`}
              className={classNames.item || (components.Item ? '' : 'mb-3 px-3')}
            >
              <ItemLink
                to={activity.route}
                className={
                  classNames.itemLink ||
                  (components.ItemLink ? '' : 'text-decoration-none d-flex align-items-center')
                }
              >
                {showItemIcon && (
                  <IconWrapper $bgColor={activity.bgColor} $color={activity.color}>
                    <IconComponent fontSize="medium" />
                  </IconWrapper>
                )}
                <ContentWrapper>
                  <StyledTitleSpan
                    className={
                      classNames.itemTitle ||
                      (components.StyledTitleSpan ? '' : 'text-truncate d-block fw-bold text-dark')
                    }
                  >
                    {activity.title}
                  </StyledTitleSpan>
                  <ItemSubtitle
                    className={
                      classNames.itemSubtitle ||
                      (components.ItemSubtitle ? '' : 'text-truncate d-block text-muted')
                    }
                  >
                    {activity.subtitle || activity.scopeKey}
                  </ItemSubtitle>
                </ContentWrapper>
              </ItemLink>
            </Item>
          );
        })}
      </List>
    </Container>
  );
};

RecentActivityList.propTypes = {
  config: PropTypes.shape({
    storageKey: PropTypes.string.isRequired,
    maxItems: PropTypes.number,
    globalRoots: PropTypes.arrayOf(PropTypes.string),
    scope: PropTypes.string,
    titles: PropTypes.shape({
      header: PropTypes.string,
      emptyScoped: PropTypes.string,
    }),
    routes: PropTypes.shape({
      scopedDashboard: PropTypes.func,
    }),
    classNames: PropTypes.shape({
      container: PropTypes.string,
      title: PropTypes.string,
      list: PropTypes.string,
      item: PropTypes.string,
      itemLink: PropTypes.string,
      itemTitle: PropTypes.string,
      itemSubtitle: PropTypes.string,
      emptyContainer: PropTypes.string,
      emptyLink: PropTypes.string,
    }),
    showItemIcon: PropTypes.bool,
  }).isRequired,
};

export default RecentActivityList;
