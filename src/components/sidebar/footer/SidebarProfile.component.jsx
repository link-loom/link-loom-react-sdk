import React from 'react';
import { styled } from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import { Domain as AddBusinessIcon, CloseRounded as CloseIcon } from '@mui/icons-material';

const OrganizationAvatar = styled('div')(({ theme }) => ({
  width: '32px',
  height: '32px',
  fontSize: '14px',
  minWidth: '32px',
}));

const OrganizationsContainer = styled('section')({
  width: '340px',
  zIndex: 1060,
  position: 'relative',
});

const AddOrganizationIconWrapper = styled('div')({
  width: '72px',
  height: '72px',
  borderRadius: '24px',
});

const CloseMenuIcon = styled(CloseIcon)({
  cursor: 'pointer',
  color: '#94a3b8',
  fontSize: '20px !important',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#475569',
  },
});

const AddOrganizationIcon = styled(AddBusinessIcon)({
  fontSize: '32px !important',
  color: '#0f172a',
});

const ProfileToggleButton = styled('button')({
  transition: 'all 0.2s',
});

const OrganizationName = styled('span')({
  fontSize: '13px',
});

const OrganizationsDropdown = styled('article')({
  zIndex: 1060,
});

const OrganizationsHeaderTitle = styled('h6')({
  fontSize: '16px',
});

const SidebarProfileComponent = ({ user, isCondensed }) => {
  return (
    <section className="dropup notification-list">
      <Tooltip
        title={
          isCondensed
            ? user?.linked_organizations?.[0]?.context?.organization_display_name ||
              'Blackwood Stone Holdings, inc.'
            : 'Organizations'
        }
        placement="right"
      >
        <ProfileToggleButton
          type="button"
          className={`btn border-0 p-2 w-100 d-flex align-items-center ${
            isCondensed ? 'justify-content-center' : 'justify-content-start'
          } dropdown-toggle waves-effect waves-light`}
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <OrganizationAvatar
            className={`d-flex bg-warning justify-content-center align-items-center rounded text-white fw-bold ${
              isCondensed ? '' : 'me-3'
            }`}
          >
            {user?.linked_organizations?.[0]?.context?.organization_display_name
              ?.charAt(0)
              ?.toUpperCase() || 'B'}
          </OrganizationAvatar>

          {!isCondensed && (
            <div className="d-flex flex-column overflow-hidden text-start flex-grow-1">
              <OrganizationName className="fw-bold text-dark text-truncate">
                {user?.linked_organizations?.[0]?.context?.organization_display_name ||
                  'Blackwood Stone Holdings, inc.'}
              </OrganizationName>
              <small className="text-muted">{user?.payload?.roles?.[0]?.context?.role_name}</small>
            </div>
          )}
        </ProfileToggleButton>
      </Tooltip>

      <OrganizationsDropdown className="dropdown-menu profile-dropdown p-0 shadow-lg border-0 mb-2">
        <OrganizationsContainer className="d-flex flex-column align-items-center p-4">
          <header className="w-100 d-flex justify-content-between align-items-center mb-4">
            <OrganizationsHeaderTitle className="fw-bold text-dark m-0">
              My organizations
            </OrganizationsHeaderTitle>
            <CloseMenuIcon />
          </header>

          <AddOrganizationIconWrapper className="d-flex justify-content-center align-items-center bg-light border mb-4">
            <AddOrganizationIcon />
          </AddOrganizationIconWrapper>

          <h5 className="text-center mb-2">Add other organizations to your account!</h5>
          <p className="text-center text-muted mb-0">
            <small>
              Manage all your organizations in one place and simplify your administration.
            </small>
          </p>
        </OrganizationsContainer>
      </OrganizationsDropdown>
    </section>
  );
};

export default SidebarProfileComponent;
