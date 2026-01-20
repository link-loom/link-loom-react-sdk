import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RecentActivityList = ({ config }) => {
    const {
        storageKey,
        maxItems = 3,
        globalRoots = ['dashboard', 'institutions', 'settings'],
        titles = {
            header: 'Recent',
            emptyScoped: 'Go to Dashboard',
        },
        routes = {
            scopedDashboard: (scopeKey) => `/${scopeKey}/dashboard`,
        },
    } = config;

    const [activities, setActivities] = useState([]);
    const [scope, setScope] = useState({ key: '', isGlobal: false });

    useEffect(() => {
        const loadActivities = () => {
            // 1. Determine Scope
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const firstSegment = pathSegments[0] || '';
            const isGlobal = globalRoots.includes(firstSegment);
            setScope({ key: firstSegment, isGlobal });

            // 2. Read from LocalStorage
            try {
                const storedData = localStorage.getItem(storageKey);
                if (storedData) {
                    let parsedData = JSON.parse(storedData);
                    if (Array.isArray(parsedData)) {
                        const filtered = parsedData.filter(item => {
                            if (isGlobal) {
                                return true;
                            } else {
                                const scopeMatch = item.scopeKey === firstSegment;
                                const routeSafe = item.route && item.route.startsWith(`/${firstSegment}/`);
                                return scopeMatch && routeSafe;
                            }
                        });

                        filtered.sort((a, b) => b.updatedAt - a.updatedAt);
                        setActivities(filtered.slice(0, maxItems));
                    }
                }
            } catch (error) {
                console.error("Error reading recent activity", error);
            }
        };

        loadActivities();

        const handleStorageUpdate = (event) => {
            if (event.detail && event.detail.storageKey === storageKey) {
                loadActivities();
            }
        };

        window.addEventListener('recentActivityUpdated', handleStorageUpdate);

        // Optional: Listen to 'storage' event for cross-tab updates
        window.addEventListener('storage', (e) => {
            if (e.key === storageKey) loadActivities();
        });

        return () => {
            window.removeEventListener('recentActivityUpdated', handleStorageUpdate);
            window.removeEventListener('storage', loadActivities);
        };

    }, [storageKey, maxItems, JSON.stringify(globalRoots), window.location.pathname]);
    // But usually Sidebar re-renders on route change if parent updates.
    // If not, we might need useLocation from router or reliable event.
    // Since this is an SDK component, we might not have access to specific Router hooks easily 
    // without peerDeps. Standard SDKs might use window events or expect re-render.
    // Let's assume parent re-renders sidebar on route change.

    if (!scope.isGlobal && activities.length === 0) {
        return (
            <div className="recent-activity-list recent-activity-empty">
                <h5 className="header-title mb-2">{titles.header || 'Recent'}</h5>
                <a href={routes.scopedDashboard(scope.key)} className="text-muted">
                    {titles.emptyScoped}
                </a>
            </div>
        );
    }

    if (scope.isGlobal && activities.length === 0) {
        return null;
    }

    return (
        <div className="recent-activity-list">
            <h5 className="header-title mb-2">{titles.header || 'Recent'}</h5>
            <ul className="list-unstyled">
                {activities.map((activity, index) => (
                    <li key={`${activity.scopeKey}-${activity.entityId}-${index}`} className="mb-2">
                        <a href={activity.route} className="text-body d-block">
                            <span className="fw-bold">{activity.title}</span>
                            <br />
                            <small className="text-muted">
                                {activity.subtitle || activity.scopeKey}
                            </small>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

RecentActivityList.propTypes = {
    config: PropTypes.shape({
        storageKey: PropTypes.string.isRequired,
        maxItems: PropTypes.number,
        globalRoots: PropTypes.arrayOf(PropTypes.string),
        titles: PropTypes.shape({
            header: PropTypes.string,
            emptyScoped: PropTypes.string,
        }),
        routes: PropTypes.shape({
            scopedDashboard: PropTypes.func,
        }),
    }).isRequired,
};

export default RecentActivityList;
