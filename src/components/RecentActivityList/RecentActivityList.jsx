import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';

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
        showItemIcon = true,
    } = config;

    const { classNames = {} } = config; // Destructure classNames from config (or props if preferred directly on component)
    // Applying default classNames if not provided
    const styles = {
        container: classNames.container || 'RecentActivityList',
        title: classNames.title || 'menu-title', // Matches sidebar 'menu-title'
        list: classNames.list || 'list-unstyled',
        item: classNames.item || 'mb-3 px-3',
        itemLink: classNames.itemLink || 'text-secondary', // Matches sidebar 'text-secondary'
        itemTitle: classNames.itemTitle || '', // Removed fw-bold to match sidebar font weight
        itemSubtitle: classNames.itemSubtitle || '',
        emptyContainer: classNames.emptyContainer || 'recent-activity-list recent-activity-empty',
        emptyLink: classNames.emptyLink || 'text-primary'
    };

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
            <div className={styles.emptyContainer}>
                <div className={styles.title}>{titles.header || 'Recent'}</div>
                <Link to={routes.scopedDashboard(scope.key)} className={styles.emptyLink}>
                    {titles.emptyScoped}
                </Link>
            </div>
        );
    }

    if (scope.isGlobal && activities.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>{titles.header || 'Recent'}</div>
            <ul className={styles.list}>
                {activities.map((activity, index) => (
                    <li key={`${activity.scopeKey}-${activity.entityId}-${index}`} className={styles.item}>
                        <Link to={activity.route} className={styles.itemLink}>
                            {showItemIcon && <PanoramaFishEyeIcon className="me-2" style={{ fontSize: '1.2em', verticalAlign: 'middle' }} />}
                            <span className={styles.itemTitle}>{activity.title}</span>
                            <br />
                            <span className={styles.itemSubtitle}>
                                {activity.subtitle || activity.scopeKey}
                            </span>
                        </Link>
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
