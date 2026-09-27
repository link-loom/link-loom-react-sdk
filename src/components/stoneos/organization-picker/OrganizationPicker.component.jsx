import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material';
import { isUnauthorized, loadCollection } from '../shared/readCollection.js';
import OrganizationAvatar from './OrganizationAvatar.component.jsx';
import OrganizationBadge from './OrganizationBadge.component.jsx';
import {
  ORGANIZATION_DIRECTORY_STATUS,
  ORGANIZATION_PICKER_LABELS,
  ORGANIZATION_STATUS_OPTION_ID,
  buildOrganizationOptions,
} from './organizationPicker.helpers.js';

const PAGE_SIZE = 25;
const SEARCH_DELAY_MS = 300;

/**
 * Picks an organization from the directory (`searchOrganizations({ search, pageSize })`, which answers
 * `{ items }`, an envelope or a list; only the organizations that chose to receive work from others are
 * there). The directory loads when the field opens and narrows on the server as the person types. A
 * directory that could not answer says so and offers to try again: it is never drawn as an empty list,
 * which would read as "nobody is listed". Your own organization (`myOrganization`) leads the list
 * (`includeMine`), listed or not, because it is the default destination of everything you create.
 */
function OrganizationPicker({
  value,
  onChange,
  searchOrganizations,
  myOrganization = null,
  includeMine = true,
  label,
  placeholder,
  disabled = false,
  autoFocus = false,
  error = false,
  helperText,
  size = 'small',
  labels,
  sx = {},
}) {
  // -----------------------------------------------------
  // 1. Models / State
  // -----------------------------------------------------
  const [entries, setEntries] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // -----------------------------------------------------
  // 2. UI States
  // -----------------------------------------------------
  const [status, setStatus] = useState(ORGANIZATION_DIRECTORY_STATUS.idle);
  const [isOpen, setIsOpen] = useState(false);
  const ticketRef = useRef(0);
  const timerRef = useRef(null);
  const lastQueryRef = useRef(null);

  // -----------------------------------------------------
  // 3. Configs / Constants
  // -----------------------------------------------------
  const resolvedLabels = { ...ORGANIZATION_PICKER_LABELS, ...labels };
  const options = useMemo(
    () =>
      buildOrganizationOptions({
        entries,
        myOrganization,
        includeMine,
        // Opening a field that shows its value is not a search for that value.
        text: isOpen && value && inputValue === value.display_name ? '' : inputValue,
        status,
      }),
    [entries, includeMine, myOrganization, inputValue, isOpen, value, status],
  );
  const hasText = Boolean(inputValue.trim()) && inputValue !== value?.display_name;
  const isFailed =
    status === ORGANIZATION_DIRECTORY_STATUS.error ||
    status === ORGANIZATION_DIRECTORY_STATUS.unauthorized;

  // -----------------------------------------------------
  // 4. Component Functions
  // -----------------------------------------------------
  const fetchEntries = async (text) => {
    const ticket = ++ticketRef.current;
    lastQueryRef.current = text;
    setStatus(ORGANIZATION_DIRECTORY_STATUS.loading);

    const collection = await loadCollection(searchOrganizations, {
      search: text,
      pageSize: PAGE_SIZE,
    });
    if (ticket !== ticketRef.current) {
      return;
    }

    if (!collection.ok) {
      setEntries([]);
      setStatus(
        isUnauthorized(collection)
          ? ORGANIZATION_DIRECTORY_STATUS.unauthorized
          : ORGANIZATION_DIRECTORY_STATUS.error,
      );
      return;
    }

    setEntries(collection.items);
    setStatus(ORGANIZATION_DIRECTORY_STATUS.ready);
  };

  const scheduleFetch = (text) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchEntries(text), SEARCH_DELAY_MS);
  };

  const onOpen = () => {
    setIsOpen(true);
    if (status === ORGANIZATION_DIRECTORY_STATUS.idle || isFailed || lastQueryRef.current !== '') {
      fetchEntries('');
    }
  };

  const onInputChange = (event, next, reason) => {
    setInputValue(next);
    // Picking an option writes its name into the field; that is not a search.
    if (reason === 'reset') {
      return;
    }
    const text = next.trim();
    if (!text) {
      clearTimeout(timerRef.current);
      fetchEntries('');
      return;
    }
    scheduleFetch(text);
  };

  const select = (event, next) => {
    if (next?.id === ORGANIZATION_STATUS_OPTION_ID) {
      return;
    }
    onChange?.(next || null);
  };

  const renderFailure = (failure) =>
    failure === ORGANIZATION_DIRECTORY_STATUS.unauthorized ? (
      <Typography variant="body2" sx={{ color: 'error.main' }}>
        {resolvedLabels.sessionExpired}
      </Typography>
    ) : (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          width: '100%',
        }}
      >
        <Typography variant="body2" sx={{ color: 'error.main' }}>
          {resolvedLabels.loadFailed}
        </Typography>
        <Button
          size="small"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => fetchEntries(lastQueryRef.current || '')}
        >
          {resolvedLabels.retry}
        </Button>
      </Box>
    );

  // -----------------------------------------------------
  // 5. Lifecycle
  // -----------------------------------------------------
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // -----------------------------------------------------
  // 6. Render
  // -----------------------------------------------------
  const noOptionsText = isFailed
    ? renderFailure(status)
    : hasText
      ? resolvedLabels.noMatch
      : resolvedLabels.empty;

  return (
    <Autocomplete
      size={size}
      fullWidth
      sx={sx}
      disabled={disabled}
      open={isOpen}
      onOpen={onOpen}
      onClose={() => setIsOpen(false)}
      options={options}
      value={value || null}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onChange={select}
      filterOptions={(list) => list}
      loading={status === ORGANIZATION_DIRECTORY_STATUS.loading}
      loadingText={resolvedLabels.loading}
      noOptionsText={noOptionsText}
      getOptionLabel={(option) => option?.display_name || ''}
      isOptionEqualToValue={(option, candidate) => option?.id === candidate?.id}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return option.id === ORGANIZATION_STATUS_OPTION_ID ? (
          <Box
            component="li"
            {...optionProps}
            key={option.id}
            sx={{ borderTop: 1, borderColor: 'divider', cursor: 'default' }}
          >
            {renderFailure(option.status)}
          </Box>
        ) : (
          <Box component="li" {...optionProps} key={option.id}>
            <OrganizationBadge
              organization={option}
              size={24}
              labels={resolvedLabels}
              caption={option.id === myOrganization?.id ? resolvedLabels.mine : option.slug}
            />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label ?? resolvedLabels.label}
          placeholder={placeholder ?? resolvedLabels.search}
          autoFocus={autoFocus}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: value ? (
              <Box sx={{ display: 'inline-flex', ml: 0.5, mr: 0.5 }}>
                <OrganizationAvatar organization={value} size={20} />
              </Box>
            ) : (
              params.InputProps?.startAdornment
            ),
          }}
        />
      )}
    />
  );
}

export default OrganizationPicker;
