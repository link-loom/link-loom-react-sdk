import React, { useEffect, useState } from 'react';
import { Autocomplete, Avatar, Box, TextField, Typography } from '@mui/material';
import { GroupsOutlined as TeamIcon } from '@mui/icons-material';

const SEARCH_DEBOUNCE_MS = 250;
const MEMBERS_PAGE_SIZE = 50;

export const PEOPLE_PICKER_LABELS = {
  searchPlaceholder: 'Search people',
  searching: 'Searching…',
  noResults: 'No matches',
  loadError: 'The directory is unavailable',
};

export const peopleOptionKey = (option) => `${option.kind}:${option.id}`;

const personLabel = (person) => person.display_name || person.username || person.email || person.veripass_identity;

const toPersonOption = (person) => ({
  kind: 'user',
  id: person.veripass_identity,
  label: personLabel(person),
  secondary: person.email || '',
  avatarUrl: person.avatar_url || '',
  source: person,
});

const toTeamOption = (team) => ({
  kind: 'team',
  id: team.id,
  label: team.name,
  secondary: team.description || '',
  avatarUrl: '',
  source: team,
});

// Directory picker shared by the StoneOS apps. The organization members (and, with `includeTeams`, the
// teams) are loaded once and offered as soon as the field is focused, so the list is never empty before
// the first keystroke; typing narrows it through the directory search selector. A directory that cannot
// be read says so instead of looking like an organization with nobody in it.
// `directory` is `sdk.directory`; `onSelect` receives a normalized option carrying the raw record in
// `source`. Labels follow the kit convention (see PEOPLE_PICKER_LABELS).
export default function PeoplePicker({
  directory,
  onSelect,
  labels,
  includeTeams = false,
  excludeKeys = [],
  autoFocus = false,
  disabled = false,
  sx,
}) {
  // -----------------------------------------------------
  // 1. UI States
  // -----------------------------------------------------
  const [searchText, setSearchText] = useState('');
  const [directoryOptions, setDirectoryOptions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // -----------------------------------------------------
  // 2. Derived
  // -----------------------------------------------------
  const resolvedLabels = { ...PEOPLE_PICKER_LABELS, ...labels };
  const trimmedText = searchText.trim();
  const excluded = new Set(excludeKeys);
  const teams = directoryOptions.filter((option) => option.kind === 'team');
  const options = (trimmedText ? matches : directoryOptions).filter((option) => !excluded.has(peopleOptionKey(option)));
  const noOptionsText = failed ? resolvedLabels.loadError : resolvedLabels.noResults;

  // -----------------------------------------------------
  // 3. Lifecycle
  // -----------------------------------------------------
  useEffect(() => {
    if (!directory) {
      setFailed(true);
      return undefined;
    }

    let active = true;
    setLoading(true);
    setFailed(false);
    Promise.all([
      directory.listMembers({ pageSize: MEMBERS_PAGE_SIZE }),
      includeTeams ? directory.listTeams() : Promise.resolve({ items: [] }),
    ])
      .then(([members, teamList]) => {
        if (!active) {
          return;
        }
        setDirectoryOptions([...members.items.map(toPersonOption), ...teamList.items.map(toTeamOption)]);
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [directory, includeTeams]);

  // Teams are not searchable through the directory, so they are narrowed locally over the loaded list.
  useEffect(() => {
    if (!trimmedText || !directory) {
      setMatches([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const result = await directory.searchPeople(trimmedText).catch(() => null);
      if (!active) {
        return;
      }
      const lowered = trimmedText.toLowerCase();
      setFailed(!result);
      setMatches([
        ...(result?.items || []).map(toPersonOption),
        ...teams.filter((team) => team.label.toLowerCase().includes(lowered)),
      ]);
      setLoading(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmedText, directory, directoryOptions]);

  // -----------------------------------------------------
  // 4. Render
  // -----------------------------------------------------
  return (
    <Autocomplete
      size="small"
      openOnFocus
      options={options}
      loading={loading}
      disabled={disabled}
      filterOptions={(list) => list}
      getOptionLabel={(option) => option.label || ''}
      isOptionEqualToValue={(option, value) => peopleOptionKey(option) === peopleOptionKey(value)}
      inputValue={searchText}
      onInputChange={(event, nextValue, reason) => reason !== 'reset' && setSearchText(nextValue)}
      value={null}
      onChange={(event, option) => {
        if (!option) {
          return;
        }
        setSearchText('');
        onSelect(option);
      }}
      noOptionsText={noOptionsText}
      loadingText={resolvedLabels.searching}
      renderOption={(props, option) => (
        <li {...props} key={peopleOptionKey(option)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            {option.kind === 'team' ? (
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'var(--stos-bg-muted)', color: 'text.secondary' }}>
                <TeamIcon sx={{ fontSize: 14 }} />
              </Avatar>
            ) : (
              <Avatar src={option.avatarUrl || undefined} sx={{ width: 24, height: 24, fontSize: 12 }}>
                {String(option.label).charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap>
                {option.label}
              </Typography>
              {option.secondary && (
                <Typography variant="caption" component="p" noWrap sx={{ color: 'text.tertiary' }}>
                  {option.secondary}
                </Typography>
              )}
            </Box>
          </Box>
        </li>
      )}
      renderInput={(params) => <TextField {...params} autoFocus={autoFocus} placeholder={resolvedLabels.searchPlaceholder} />}
      sx={{ flex: 1, minWidth: 180, ...sx }}
    />
  );
}
