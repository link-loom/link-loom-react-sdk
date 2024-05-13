import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import styled from 'styled-components';

const StyledListItem = styled.li`
  & > img {
    margin-right: 6px;
    flex-shrink: 0;
  }
`;

const isEmpty = (value) => {
  return value.trim() === '';
};

// Transform data from database format to component format
const transformNormalizedData = (data) => {
  if (!data) {
    return null;
  }
  return {
    countryCode: data?.iso_code,
    dialCode: data?.dial_code,
    label: data?.name,
  };
};

// Transform data from component format to database format
const transformToDatabaseFormat = (data) => {
  if (!data) {
    return null;
  }
  return {
    iso_code: data?.countryCode,
    dial_code: data?.dialCode,
    name: data?.label,
  };
};

export default function PhoneCountrySelector(props) {
  const { value, label, onPhoneChange, disabled, variant } = props;
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [phoneFieldClicked, setPhoneFieldClicked] = useState(false);
  const [phoneInputValue, setPhoneInputValue] = useState('');

  useEffect(() => {
    if (!isEmpty(phoneInputValue)) {
      const internationalPhoneNumber = `${selectedCountry?.dialCode}${phoneInputValue || ''}`;

      onPhoneChange({
        country: transformToDatabaseFormat(selectedCountry),
        international_phone_number: internationalPhoneNumber,
        phone_number: phoneInputValue,
      });
    }
  }, [phoneInputValue, selectedCountry, onPhoneChange]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
    setIsCountrySelected(true);
  };

  const handlePhoneClick = () => {
    if (!isCountrySelected) {
      setSelectedCountry(null);
      setPhoneFieldClicked(true);
    }
  };

  const handlePhoneInputChange = (event) => {
    const inputValue = event?.target?.value;
    const sanitizedInputValue = sanitizeInput(inputValue);

    if (/^[0-9]*$/.test(sanitizedInputValue)) {
      setPhoneInputValue(sanitizedInputValue);
    }
  };

  function sanitizeInput(input) {
    return input.replace(/[^0-9]/g, '');
  }

  useEffect(() => {
    if (value && phoneInputValue !== value?.phone_number) {
      setSelectedCountry(transformNormalizedData(value?.country ?? null));
      setPhoneInputValue(value?.phone_number ?? '');
      setIsCountrySelected(!!value?.country);
    }
  }, [value]);

  return (
    <section className="d-md-flex">
      <article className="col-md-6 col-12">
        <Autocomplete
          id="select-country"
          options={countries.map(transformNormalizedData)}
          autoHighlight
          value={selectedCountry}
          onChange={handleCountryChange}
          disableClearable
          isOptionEqualToValue={(option, value) => option.countryCode === value.countryCode}
          getOptionLabel={(option) => '+' + option.dialCode}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.countryCode.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.label.toLowerCase().includes(inputValue.toLowerCase()),
            )
          }
          renderOption={(props, option) => (
            <StyledListItem {...props} key={option.countryCode}>
              <img
                loading="lazy"
                width="20"
                srcSet={`https://flagcdn.com/w40/${option?.countryCode?.toLowerCase()}.png 2x`}
                src={`https://flagcdn.com/w20/${option?.countryCode?.toLowerCase()}.png`}
                alt=""
              />
              {option.label}
            </StyledListItem>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country"
              autoComplete="link-loom-select"
              name="link-loom-select"
              id="link-loom-select"
              disabled={disabled}
              variant={disabled ? 'filled' : variant ? variant : 'outlined'}
              InputProps={{
                ...params.InputProps,
                autoComplete: 'link-loom-select',
                startAdornment: selectedCountry && (
                  <>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${selectedCountry?.countryCode?.toLowerCase()}.png`}
                      alt=""
                    />
                  </>
                ),
              }}
            />
          )}
        />
      </article>

      <article className="col-md-6 col-12 ms-0 ms-md-1">
        <TextField
          type="tel"
          id="primary_phone_number"
          name="primary_phone_number"
          autoComplete="new-password"
          value={phoneInputValue}
          placeholder="3002355432"
          label={label || 'Phone number'}
          onFocus={handlePhoneClick}
          onChange={handlePhoneInputChange}
          disabled={!isCountrySelected || disabled}
          variant={!isCountrySelected || disabled ? 'filled' : variant ? variant : 'outlined'}
        />
      </article>
    </section>
  );
}

// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
const countries = [
  { iso_code: 'AD', name: 'Andorra', dial_code: '376' },
  { iso_code: 'AE', name: 'United Arab Emirates', dial_code: '971' },
  { iso_code: 'AF', name: 'Afghanistan', dial_code: '93' },
  { iso_code: 'AG', name: 'Antigua and Barbuda', dial_code: '1-268' },
  { iso_code: 'AI', name: 'Anguilla', dial_code: '1-264' },
  { iso_code: 'AL', name: 'Albania', dial_code: '355' },
  { iso_code: 'AM', name: 'Armenia', dial_code: '374' },
  { iso_code: 'AO', name: 'Angola', dial_code: '244' },
  { iso_code: 'AQ', name: 'Antarctica', dial_code: '672' },
  { iso_code: 'AR', name: 'Argentina', dial_code: '54' },
  { iso_code: 'AS', name: 'American Samoa', dial_code: '1-684' },
  { iso_code: 'AT', name: 'Austria', dial_code: '43' },
  { iso_code: 'AU', name: 'Australia', dial_code: '61' },
  { iso_code: 'AW', name: 'Aruba', dial_code: '297' },
  { iso_code: 'AX', name: 'Alland Islands', dial_code: '358' },
  { iso_code: 'AZ', name: 'Azerbaijan', dial_code: '994' },
  { iso_code: 'BA', name: 'Bosnia and Herzegovina', dial_code: '387' },
  { iso_code: 'BB', name: 'Barbados', dial_code: '1-246' },
  { iso_code: 'BD', name: 'Bangladesh', dial_code: '880' },
  { iso_code: 'BE', name: 'Belgium', dial_code: '32' },
  { iso_code: 'BF', name: 'Burkina Faso', dial_code: '226' },
  { iso_code: 'BG', name: 'Bulgaria', dial_code: '359' },
  { iso_code: 'BH', name: 'Bahrain', dial_code: '973' },
  { iso_code: 'BI', name: 'Burundi', dial_code: '257' },
  { iso_code: 'BJ', name: 'Benin', dial_code: '229' },
  { iso_code: 'BL', name: 'Saint Barthelemy', dial_code: '590' },
  { iso_code: 'BM', name: 'Bermuda', dial_code: '1-441' },
  { iso_code: 'BN', name: 'Brunei Darussalam', dial_code: '673' },
  { iso_code: 'BO', name: 'Bolivia', dial_code: '591' },
  { iso_code: 'BR', name: 'Brazil', dial_code: '55' },
  { iso_code: 'BS', name: 'Bahamas', dial_code: '1-242' },
  { iso_code: 'BT', name: 'Bhutan', dial_code: '975' },
  { iso_code: 'BV', name: 'Bouvet Island', dial_code: '47' },
  { iso_code: 'BW', name: 'Botswana', dial_code: '267' },
  { iso_code: 'BY', name: 'Belarus', dial_code: '375' },
  { iso_code: 'BZ', name: 'Belize', dial_code: '501' },
  { iso_code: 'CA', name: 'Canada', dial_code: '1', suggested: true },
  { iso_code: 'CC', name: 'Cocos (Keeling) Islands', dial_code: '61' },
  { iso_code: 'CD', name: 'Congo, Democratic Republic of the', dial_code: '243' },
  { iso_code: 'CF', name: 'Central African Republic', dial_code: '236' },
  { iso_code: 'CG', name: 'Congo, Republic of the', dial_code: '242' },
  { iso_code: 'CH', name: 'Switzerland', dial_code: '41' },
  { iso_code: 'CI', name: "Cote d'Ivoire", dial_code: '225' },
  { iso_code: 'CK', name: 'Cook Islands', dial_code: '682' },
  { iso_code: 'CL', name: 'Chile', dial_code: '56' },
  { iso_code: 'CM', name: 'Cameroon', dial_code: '237' },
  { iso_code: 'CN', name: 'China', dial_code: '86' },
  { iso_code: 'CO', name: 'Colombia', dial_code: '57' },
  { iso_code: 'CR', name: 'Costa Rica', dial_code: '506' },
  { iso_code: 'CU', name: 'Cuba', dial_code: '53' },
  { iso_code: 'CV', name: 'Cape Verde', dial_code: '238' },
  { iso_code: 'CW', name: 'Curacao', dial_code: '599' },
  { iso_code: 'CX', name: 'Christmas Island', dial_code: '61' },
  { iso_code: 'CY', name: 'Cyprus', dial_code: '357' },
  { iso_code: 'CZ', name: 'Czech Republic', dial_code: '420' },
  { iso_code: 'DE', name: 'Germany', dial_code: '49' },
  { iso_code: 'DJ', name: 'Djibouti', dial_code: '253' },
  { iso_code: 'DK', name: 'Denmark', dial_code: '45' },
  { iso_code: 'DM', name: 'Dominica', dial_code: '1-767' },
  { iso_code: 'DO', name: 'Dominican Republic', dial_code: '1-809' },
  { iso_code: 'DZ', name: 'Algeria', dial_code: '213' },
  { iso_code: 'EC', name: 'Ecuador', dial_code: '593' },
  { iso_code: 'EE', name: 'Estonia', dial_code: '372' },
  { iso_code: 'EG', name: 'Egypt', dial_code: '20' },
  { iso_code: 'EH', name: 'Western Sahara', dial_code: '212' },
  { iso_code: 'ER', name: 'Eritrea', dial_code: '291' },
  { iso_code: 'ES', name: 'Spain', dial_code: '34' },
  { iso_code: 'ET', name: 'Ethiopia', dial_code: '251' },
  { iso_code: 'FI', name: 'Finland', dial_code: '358' },
  { iso_code: 'FJ', name: 'Fiji', dial_code: '679' },
  { iso_code: 'FK', name: 'Falkland Islands (Malvinas)', dial_code: '500' },
  { iso_code: 'FM', name: 'Micronesia, Federated States of', dial_code: '691' },
  { iso_code: 'FO', name: 'Faroe Islands', dial_code: '298' },
  { iso_code: 'FR', name: 'France', dial_code: '33' },
  { iso_code: 'GA', name: 'Gabon', dial_code: '241' },
  { iso_code: 'GB', name: 'United Kingdom', dial_code: '44' },
  { iso_code: 'GD', name: 'Grenada', dial_code: '1-473' },
  { iso_code: 'GE', name: 'Georgia', dial_code: '995' },
  { iso_code: 'GF', name: 'French Guiana', dial_code: '594' },
  { iso_code: 'GG', name: 'Guernsey', dial_code: '44' },
  { iso_code: 'GH', name: 'Ghana', dial_code: '233' },
  { iso_code: 'GI', name: 'Gibraltar', dial_code: '350' },
  { iso_code: 'GL', name: 'Greenland', dial_code: '299' },
  { iso_code: 'GM', name: 'Gambia', dial_code: '220' },
  { iso_code: 'GN', name: 'Guinea', dial_code: '224' },
  { iso_code: 'GP', name: 'Guadeloupe', dial_code: '590' },
  { iso_code: 'GQ', name: 'Equatorial Guinea', dial_code: '240' },
  { iso_code: 'GR', name: 'Greece', dial_code: '30' },
  { iso_code: 'GS', name: 'South Georgia and the South Sandwich Islands', dial_code: '500' },
  { iso_code: 'GT', name: 'Guatemala', dial_code: '502' },
  { iso_code: 'GU', name: 'Guam', dial_code: '1-671' },
  { iso_code: 'GW', name: 'Guinea-Bissau', dial_code: '245' },
  { iso_code: 'GY', name: 'Guyana', dial_code: '592' },
  { iso_code: 'HK', name: 'Hong Kong', dial_code: '852' },
  { iso_code: 'HM', name: 'Heard Island and McDonald Islands', dial_code: '672' },
  { iso_code: 'HN', name: 'Honduras', dial_code: '504' },
  { iso_code: 'HR', name: 'Croatia', dial_code: '385' },
  { iso_code: 'HT', name: 'Haiti', dial_code: '509' },
  { iso_code: 'HU', name: 'Hungary', dial_code: '36' },
  { iso_code: 'ID', name: 'Indonesia', dial_code: '62' },
  { iso_code: 'IE', name: 'Ireland', dial_code: '353' },
  { iso_code: 'IL', name: 'Israel', dial_code: '972' },
  { iso_code: 'IM', name: 'Isle of Man', dial_code: '44' },
  { iso_code: 'IN', name: 'India', dial_code: '91' },
  { iso_code: 'IO', name: 'British Indian Ocean Territory', dial_code: '246' },
  { iso_code: 'IQ', name: 'Iraq', dial_code: '964' },
  { iso_code: 'IR', name: 'Iran, Islamic Republic of', dial_code: '98' },
  { iso_code: 'IS', name: 'Iceland', dial_code: '354' },
  { iso_code: 'IT', name: 'Italy', dial_code: '39' },
  { iso_code: 'JE', name: 'Jersey', dial_code: '44' },
  { iso_code: 'JM', name: 'Jamaica', dial_code: '1-876' },
  { iso_code: 'JO', name: 'Jordan', dial_code: '962' },
  { iso_code: 'JP', name: 'Japan', dial_code: '81' },
  { iso_code: 'KE', name: 'Kenya', dial_code: '254' },
  { iso_code: 'KG', name: 'Kyrgyzstan', dial_code: '996' },
  { iso_code: 'KH', name: 'Cambodia', dial_code: '855' },
  { iso_code: 'KI', name: 'Kiribati', dial_code: '686' },
  { iso_code: 'KM', name: 'Comoros', dial_code: '269' },
  { iso_code: 'KN', name: 'Saint Kitts and Nevis', dial_code: '1-869' },
  { iso_code: 'KP', name: "Korea, Democratic People's Republic of", dial_code: '850' },
  { iso_code: 'KR', name: 'Korea, Republic of', dial_code: '82' },
  { iso_code: 'KW', name: 'Kuwait', dial_code: '965' },
  { iso_code: 'KY', name: 'Cayman Islands', dial_code: '1-345' },
  { iso_code: 'KZ', name: 'Kazakhstan', dial_code: '7' },
  { iso_code: 'LA', name: "Lao People's Democratic Republic", dial_code: '856' },
  { iso_code: 'LB', name: 'Lebanon', dial_code: '961' },
  { iso_code: 'LC', name: 'Saint Lucia', dial_code: '1-758' },
  { iso_code: 'LI', name: 'Liechtenstein', dial_code: '423' },
  { iso_code: 'LK', name: 'Sri Lanka', dial_code: '94' },
  { iso_code: 'LR', name: 'Liberia', dial_code: '231' },
  { iso_code: 'LS', name: 'Lesotho', dial_code: '266' },
  { iso_code: 'LT', name: 'Lithuania', dial_code: '370' },
  { iso_code: 'LU', name: 'Luxembourg', dial_code: '352' },
  { iso_code: 'LV', name: 'Latvia', dial_code: '371' },
  { iso_code: 'LY', name: 'Libya', dial_code: '218' },
  { iso_code: 'MA', name: 'Morocco', dial_code: '212' },
  { iso_code: 'MC', name: 'Monaco', dial_code: '377' },
  { iso_code: 'MD', name: 'Moldova, Republic of', dial_code: '373' },
  { iso_code: 'ME', name: 'Montenegro', dial_code: '382' },
  { iso_code: 'MF', name: 'Saint Martin (French part)', dial_code: '590' },
  { iso_code: 'MG', name: 'Madagascar', dial_code: '261' },
  { iso_code: 'MH', name: 'Marshall Islands', dial_code: '692' },
  { iso_code: 'MK', name: 'Macedonia, the Former Yugoslav Republic of', dial_code: '389' },
  { iso_code: 'ML', name: 'Mali', dial_code: '223' },
  { iso_code: 'MM', name: 'Myanmar', dial_code: '95' },
  { iso_code: 'MN', name: 'Mongolia', dial_code: '976' },
  { iso_code: 'MO', name: 'Macao', dial_code: '853' },
  { iso_code: 'MP', name: 'Northern Mariana Islands', dial_code: '1-670' },
  { iso_code: 'MQ', name: 'Martinique', dial_code: '596' },
  { iso_code: 'MR', name: 'Mauritania', dial_code: '222' },
  { iso_code: 'MS', name: 'Montserrat', dial_code: '1-664' },
  { iso_code: 'MT', name: 'Malta', dial_code: '356' },
  { iso_code: 'MU', name: 'Mauritius', dial_code: '230' },
  { iso_code: 'MV', name: 'Maldives', dial_code: '960' },
  { iso_code: 'MW', name: 'Malawi', dial_code: '265' },
  { iso_code: 'MX', name: 'Mexico', dial_code: '52' },
  { iso_code: 'MY', name: 'Malaysia', dial_code: '60' },
  { iso_code: 'MZ', name: 'Mozambique', dial_code: '258' },
  { iso_code: 'NA', name: 'Namibia', dial_code: '264' },
  { iso_code: 'NC', name: 'New Caledonia', dial_code: '687' },
  { iso_code: 'NE', name: 'Niger', dial_code: '227' },
  { iso_code: 'NF', name: 'Norfolk Island', dial_code: '672' },
  { iso_code: 'NG', name: 'Nigeria', dial_code: '234' },
  { iso_code: 'NI', name: 'Nicaragua', dial_code: '505' },
  { iso_code: 'NL', name: 'Netherlands', dial_code: '31' },
  { iso_code: 'NO', name: 'Norway', dial_code: '47' },
  { iso_code: 'NP', name: 'Nepal', dial_code: '977' },
  { iso_code: 'NR', name: 'Nauru', dial_code: '674' },
  { iso_code: 'NU', name: 'Niue', dial_code: '683' },
  { iso_code: 'NZ', name: 'New Zealand', dial_code: '64' },
  { iso_code: 'OM', name: 'Oman', dial_code: '968' },
  { iso_code: 'PA', name: 'Panama', dial_code: '507' },
  { iso_code: 'PE', name: 'Peru', dial_code: '51' },
  { iso_code: 'PF', name: 'French Polynesia', dial_code: '689' },
  { iso_code: 'PG', name: 'Papua New Guinea', dial_code: '675' },
  { iso_code: 'PH', name: 'Philippines', dial_code: '63' },
  { iso_code: 'PK', name: 'Pakistan', dial_code: '92' },
  { iso_code: 'PL', name: 'Poland', dial_code: '48' },
  { iso_code: 'PM', name: 'Saint Pierre and Miquelon', dial_code: '508' },
  { iso_code: 'PN', name: 'Pitcairn', dial_code: '870' },
  { iso_code: 'PR', name: 'Puerto Rico', dial_code: '1' },
  { iso_code: 'PS', name: 'Palestine, State of', dial_code: '970' },
  { iso_code: 'PT', name: 'Portugal', dial_code: '351' },
  { iso_code: 'PW', name: 'Palau', dial_code: '680' },
  { iso_code: 'PY', name: 'Paraguay', dial_code: '595' },
  { iso_code: 'QA', name: 'Qatar', dial_code: '974' },
  { iso_code: 'RE', name: 'Reunion', dial_code: '262' },
  { iso_code: 'RO', name: 'Romania', dial_code: '40' },
  { iso_code: 'RS', name: 'Serbia', dial_code: '381' },
  { iso_code: 'RU', name: 'Russian Federation', dial_code: '7' },
  { iso_code: 'RW', name: 'Rwanda', dial_code: '250' },
  { iso_code: 'SA', name: 'Saudi Arabia', dial_code: '966' },
  { iso_code: 'SB', name: 'Solomon Islands', dial_code: '677' },
  { iso_code: 'SC', name: 'Seychelles', dial_code: '248' },
  { iso_code: 'SD', name: 'Sudan', dial_code: '249' },
  { iso_code: 'SE', name: 'Sweden', dial_code: '46' },
  { iso_code: 'SG', name: 'Singapore', dial_code: '65' },
  { iso_code: 'SH', name: 'Saint Helena', dial_code: '290' },
  { iso_code: 'SI', name: 'Slovenia', dial_code: '386' },
  { iso_code: 'SJ', name: 'Svalbard and Jan Mayen', dial_code: '47' },
  { iso_code: 'SK', name: 'Slovakia', dial_code: '421' },
  { iso_code: 'SL', name: 'Sierra Leone', dial_code: '232' },
  { iso_code: 'SM', name: 'San Marino', dial_code: '378' },
  { iso_code: 'SN', name: 'Senegal', dial_code: '221' },
  { iso_code: 'SO', name: 'Somalia', dial_code: '252' },
  { iso_code: 'SR', name: 'Suriname', dial_code: '597' },
  { iso_code: 'SS', name: 'South Sudan', dial_code: '211' },
  { iso_code: 'ST', name: 'Sao Tome and Principe', dial_code: '239' },
  { iso_code: 'SV', name: 'El Salvador', dial_code: '503' },
  { iso_code: 'SX', name: 'Sint Maarten (Dutch part)', dial_code: '1-721' },
  { iso_code: 'SY', name: 'Syrian Arab Republic', dial_code: '963' },
  { iso_code: 'SZ', name: 'Swaziland', dial_code: '268' },
  { iso_code: 'TC', name: 'Turks and Caicos Islands', dial_code: '1-649' },
  { iso_code: 'TD', name: 'Chad', dial_code: '235' },
  { iso_code: 'TF', name: 'French Southern Territories', dial_code: '262' },
  { iso_code: 'TG', name: 'Togo', dial_code: '228' },
  { iso_code: 'TH', name: 'Thailand', dial_code: '66' },
  { iso_code: 'TJ', name: 'Tajikistan', dial_code: '992' },
  { iso_code: 'TK', name: 'Tokelau', dial_code: '690' },
  { iso_code: 'TL', name: 'Timor-Leste', dial_code: '670' },
  { iso_code: 'TM', name: 'Turkmenistan', dial_code: '993' },
  { iso_code: 'TN', name: 'Tunisia', dial_code: '216' },
  { iso_code: 'TO', name: 'Tonga', dial_code: '676' },
  { iso_code: 'TR', name: 'Turkey', dial_code: '90' },
  { iso_code: 'TT', name: 'Trinidad and Tobago', dial_code: '1-868' },
  { iso_code: 'TV', name: 'Tuvalu', dial_code: '688' },
  { iso_code: 'TW', name: 'Taiwan', dial_code: '886' },
  { iso_code: 'TZ', name: 'United Republic of Tanzania', dial_code: '255' },
  { iso_code: 'UA', name: 'Ukraine', dial_code: '380' },
  { iso_code: 'UG', name: 'Uganda', dial_code: '256' },
  { iso_code: 'US', name: 'United States', dial_code: '1', suggested: true },
  { iso_code: 'UY', name: 'Uruguay', dial_code: '598' },
  { iso_code: 'UZ', name: 'Uzbekistan', dial_code: '998' },
  { iso_code: 'VA', name: 'Holy See (Vatican City State)', dial_code: '379' },
  { iso_code: 'VC', name: 'Saint Vincent and the Grenadines', dial_code: '1-784' },
  { iso_code: 'VE', name: 'Venezuela', dial_code: '58' },
  { iso_code: 'VG', name: 'British Virgin Islands', dial_code: '1-284' },
  { iso_code: 'VI', name: 'US Virgin Islands', dial_code: '1-340' },
  { iso_code: 'VN', name: 'Vietnam', dial_code: '84' },
  { iso_code: 'VU', name: 'Vanuatu', dial_code: '678' },
  { iso_code: 'WF', name: 'Wallis and Futuna', dial_code: '681' },
  { iso_code: 'WS', name: 'Samoa', dial_code: '685' },
  { iso_code: 'XK', name: 'Kosovo', dial_code: '383' },
  { iso_code: 'YE', name: 'Yemen', dial_code: '967' },
  { iso_code: 'YT', name: 'Mayotte', dial_code: '262' },
  { iso_code: 'ZA', name: 'South Africa', dial_code: '27' },
  { iso_code: 'ZM', name: 'Zambia', dial_code: '260' },
  { iso_code: 'ZW', name: 'Zimbabwe', dial_code: '263' },
];
