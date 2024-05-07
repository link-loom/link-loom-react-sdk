import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import styled from "styled-components";

const StyledListItem = styled.li`
  & > img {
    margin-right: 6px;
    flex-shrink: 0;
  }
`;

const isEmpty = (value) => {
  return value.trim() === "";
};

export default function PhoneCountrySelector({
  label,
  onPhoneChange,
  disabled,
  variant,
}) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countrySelected, setCountrySelected] = useState(false);
  const [phoneFieldClicked, setPhoneFieldClicked] = useState(false);
  const [phoneInputValue, setPhoneInputValue] = useState("");

  useEffect(() => {
    if (!isEmpty(phoneInputValue)) {
      const whatsappPhone = `${selectedCountry?.dialCode}${phoneInputValue || ""}`;

      onPhoneChange({
        country: selectedCountry,
        whatsappPhone,
        phoneNumber: phoneInputValue,
      });
    }
  }, [phoneInputValue]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
    setCountrySelected(true);
  };

  const handlePhoneClick = () => {
    if (!countrySelected) {
      setSelectedCountry(null);
      setPhoneFieldClicked(true);
    }
  };

  /**
   * Handles changes in the phone input field.
   * It sanitizes the input to prevent XSS attacks and ensures that only numeric values are accepted to prevent DoS attacks.
   *
   * @param {Event} event - The input change event.
   */
  const handlePhoneInputChange = (event) => {
    const inputValue = event?.target?.value;

    const sanitizedInputValue = sanitizeInput(inputValue);

    if (/^[0-9]*$/.test(sanitizedInputValue)) {
      setPhoneInputValue(sanitizedInputValue);
    }
  };

  /**
   * Sanitizes the input by removing any characters that are not digits.
   * This helps to prevent malicious scripts or HTML from being processed.
   *
   * @param {string} input - The input string to be sanitized.
   * @returns {string} The sanitized string, containing only numeric characters.
   */
  function sanitizeInput(input) {
    return input.replace(/[^0-9]/g, "");
  }

  return (
    <section className="d-md-flex">
      {/* Country Section */}
      <article className="col-md-6 col-12">
        <Autocomplete
          id="select-country"
          options={countries}
          autoHighlight
          value={selectedCountry}
          onChange={handleCountryChange}
          disableClearable
          getOptionLabel={(option) => "+" + option.dialCode}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.countryCode.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            )
          }
          renderOption={(props, option) => (
            <StyledListItem {...props} key={option.countryCode}>
              <img
                loading="lazy"
                width="20"
                srcSet={`https://flagcdn.com/w40/${option.countryCode.toLocaleLowerCase()}.png 2x`}
                src={`https://flagcdn.com/w20/${option.countryCode.toLocaleLowerCase()}.png`}
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
              variant={disabled ? "filled" : variant ? variant : "outlined"}
              InputProps={{
                ...params.InputProps,
                autoComplete: "link-loom-select",
                startAdornment: selectedCountry && (
                  <>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${selectedCountry.countryCode.toLocaleLowerCase()}.png`}
                      alt=""
                    />
                  </>
                ),
              }}
            />
          )}
        />
      </article>

      {/* Phone Number Section */}
      <article className="col-md-6 col-12 ms-0 ms-md-1">
        <TextField
          type="tel"
          id="primary_phone_number"
          name="primary_phone_number"
          autoComplete="new-password"
          value={phoneInputValue}
          placeholder="3002355432"
          label={label || "Phone number"}
          onFocus={handlePhoneClick}
          onChange={handlePhoneInputChange}
          disabled={!countrySelected || disabled}
          variant={
            !countrySelected || disabled
              ? "filled"
              : variant
              ? variant
              : "outlined"
          }
        />
      </article>
    </section>
  );
}

// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
const countries = [
  { countryCode: "AD", label: "Andorra", dialCode: "376" },
  {
    countryCode: "AE",
    label: "United Arab Emirates",
    dialCode: "971",
  },
  { countryCode: "AF", label: "Afghanistan", dialCode: "93" },
  {
    countryCode: "AG",
    label: "Antigua and Barbuda",
    dialCode: "1-268",
  },
  { countryCode: "AI", label: "Anguilla", dialCode: "1-264" },
  { countryCode: "AL", label: "Albania", dialCode: "355" },
  { countryCode: "AM", label: "Armenia", dialCode: "374" },
  { countryCode: "AO", label: "Angola", dialCode: "244" },
  { countryCode: "AQ", label: "Antarctica", dialCode: "672" },
  { countryCode: "AR", label: "Argentina", dialCode: "54" },
  { countryCode: "AS", label: "American Samoa", dialCode: "1-684" },
  { countryCode: "AT", label: "Austria", dialCode: "43" },
  {
    countryCode: "AU",
    label: "Australia",
    dialCode: "61",
    suggested: true,
  },
  { countryCode: "AW", label: "Aruba", dialCode: "297" },
  { countryCode: "AX", label: "Alland Islands", dialCode: "358" },
  { countryCode: "AZ", label: "Azerbaijan", dialCode: "994" },
  {
    countryCode: "BA",
    label: "Bosnia and Herzegovina",
    dialCode: "387",
  },
  { countryCode: "BB", label: "Barbados", dialCode: "1-246" },
  { countryCode: "BD", label: "Bangladesh", dialCode: "880" },
  { countryCode: "BE", label: "Belgium", dialCode: "32" },
  { countryCode: "BF", label: "Burkina Faso", dialCode: "226" },
  { countryCode: "BG", label: "Bulgaria", dialCode: "359" },
  { countryCode: "BH", label: "Bahrain", dialCode: "973" },
  { countryCode: "BI", label: "Burundi", dialCode: "257" },
  { countryCode: "BJ", label: "Benin", dialCode: "229" },
  { countryCode: "BL", label: "Saint Barthelemy", dialCode: "590" },
  { countryCode: "BM", label: "Bermuda", dialCode: "1-441" },
  { countryCode: "BN", label: "Brunei Darussalam", dialCode: "673" },
  { countryCode: "BO", label: "Bolivia", dialCode: "591" },
  { countryCode: "BR", label: "Brazil", dialCode: "55" },
  { countryCode: "BS", label: "Bahamas", dialCode: "1-242" },
  { countryCode: "BT", label: "Bhutan", dialCode: "975" },
  { countryCode: "BV", label: "Bouvet Island", dialCode: "47" },
  { countryCode: "BW", label: "Botswana", dialCode: "267" },
  { countryCode: "BY", label: "Belarus", dialCode: "375" },
  { countryCode: "BZ", label: "Belize", dialCode: "501" },
  {
    countryCode: "CA",
    label: "Canada",
    dialCode: "1",
    suggested: true,
  },
  {
    countryCode: "CC",
    label: "Cocos (Keeling) Islands",
    dialCode: "61",
  },
  {
    countryCode: "CD",
    label: "Congo, Democratic Republic of the",
    dialCode: "243",
  },
  {
    countryCode: "CF",
    label: "Central African Republic",
    dialCode: "236",
  },
  {
    countryCode: "CG",
    label: "Congo, Republic of the",
    dialCode: "242",
  },
  { countryCode: "CH", label: "Switzerland", dialCode: "41" },
  { countryCode: "CI", label: "Cote d'Ivoire", dialCode: "225" },
  { countryCode: "CK", label: "Cook Islands", dialCode: "682" },
  { countryCode: "CL", label: "Chile", dialCode: "56" },
  { countryCode: "CM", label: "Cameroon", dialCode: "237" },
  { countryCode: "CN", label: "China", dialCode: "86" },
  { countryCode: "CO", label: "Colombia", dialCode: "57" },
  { countryCode: "CR", label: "Costa Rica", dialCode: "506" },
  { countryCode: "CU", label: "Cuba", dialCode: "53" },
  { countryCode: "CV", label: "Cape Verde", dialCode: "238" },
  { countryCode: "CW", label: "Curacao", dialCode: "599" },
  { countryCode: "CX", label: "Christmas Island", dialCode: "61" },
  { countryCode: "CY", label: "Cyprus", dialCode: "357" },
  { countryCode: "CZ", label: "Czech Republic", dialCode: "420" },
  {
    countryCode: "DE",
    label: "Germany",
    dialCode: "49",
    suggested: true,
  },
  { countryCode: "DJ", label: "Djibouti", dialCode: "253" },
  { countryCode: "DK", label: "Denmark", dialCode: "45" },
  { countryCode: "DM", label: "Dominica", dialCode: "1-767" },
  {
    countryCode: "DO",
    label: "Dominican Republic",
    dialCode: "1-809",
  },
  { countryCode: "DZ", label: "Algeria", dialCode: "213" },
  { countryCode: "EC", label: "Ecuador", dialCode: "593" },
  { countryCode: "EE", label: "Estonia", dialCode: "372" },
  { countryCode: "EG", label: "Egypt", dialCode: "20" },
  { countryCode: "EH", label: "Western Sahara", dialCode: "212" },
  { countryCode: "ER", label: "Eritrea", dialCode: "291" },
  { countryCode: "ES", label: "Spain", dialCode: "34" },
  { countryCode: "ET", label: "Ethiopia", dialCode: "251" },
  { countryCode: "FI", label: "Finland", dialCode: "358" },
  { countryCode: "FJ", label: "Fiji", dialCode: "679" },
  {
    countryCode: "FK",
    label: "Falkland Islands (Malvinas)",
    dialCode: "500",
  },
  {
    countryCode: "FM",
    label: "Micronesia, Federated States of",
    dialCode: "691",
  },
  { countryCode: "FO", label: "Faroe Islands", dialCode: "298" },
  {
    countryCode: "FR",
    label: "France",
    dialCode: "33",
    suggested: true,
  },
  { countryCode: "GA", label: "Gabon", dialCode: "241" },
  { countryCode: "GB", label: "United Kingdom", dialCode: "44" },
  { countryCode: "GD", label: "Grenada", dialCode: "1-473" },
  { countryCode: "GE", label: "Georgia", dialCode: "995" },
  { countryCode: "GF", label: "French Guiana", dialCode: "594" },
  { countryCode: "GG", label: "Guernsey", dialCode: "44" },
  { countryCode: "GH", label: "Ghana", dialCode: "233" },
  { countryCode: "GI", label: "Gibraltar", dialCode: "350" },
  { countryCode: "GL", label: "Greenland", dialCode: "299" },
  { countryCode: "GM", label: "Gambia", dialCode: "220" },
  { countryCode: "GN", label: "Guinea", dialCode: "224" },
  { countryCode: "GP", label: "Guadeloupe", dialCode: "590" },
  { countryCode: "GQ", label: "Equatorial Guinea", dialCode: "240" },
  { countryCode: "GR", label: "Greece", dialCode: "30" },
  {
    countryCode: "GS",
    label: "South Georgia and the South Sandwich Islands",
    dialCode: "500",
  },
  { countryCode: "GT", label: "Guatemala", dialCode: "502" },
  { countryCode: "GU", label: "Guam", dialCode: "1-671" },
  { countryCode: "GW", label: "Guinea-Bissau", dialCode: "245" },
  { countryCode: "GY", label: "Guyana", dialCode: "592" },
  { countryCode: "HK", label: "Hong Kong", dialCode: "852" },
  {
    countryCode: "HM",
    label: "Heard Island and McDonald Islands",
    dialCode: "672",
  },
  { countryCode: "HN", label: "Honduras", dialCode: "504" },
  { countryCode: "HR", label: "Croatia", dialCode: "385" },
  { countryCode: "HT", label: "Haiti", dialCode: "509" },
  { countryCode: "HU", label: "Hungary", dialCode: "36" },
  { countryCode: "ID", label: "Indonesia", dialCode: "62" },
  { countryCode: "IE", label: "Ireland", dialCode: "353" },
  { countryCode: "IL", label: "Israel", dialCode: "972" },
  { countryCode: "IM", label: "Isle of Man", dialCode: "44" },
  { countryCode: "IN", label: "India", dialCode: "91" },
  {
    countryCode: "IO",
    label: "British Indian Ocean Territory",
    dialCode: "246",
  },
  { countryCode: "IQ", label: "Iraq", dialCode: "964" },
  {
    countryCode: "IR",
    label: "Iran, Islamic Republic of",
    dialCode: "98",
  },
  { countryCode: "IS", label: "Iceland", dialCode: "354" },
  { countryCode: "IT", label: "Italy", dialCode: "39" },
  { countryCode: "JE", label: "Jersey", dialCode: "44" },
  { countryCode: "JM", label: "Jamaica", dialCode: "1-876" },
  { countryCode: "JO", label: "Jordan", dialCode: "962" },
  {
    countryCode: "JP",
    label: "Japan",
    dialCode: "81",
    suggested: true,
  },
  { countryCode: "KE", label: "Kenya", dialCode: "254" },
  { countryCode: "KG", label: "Kyrgyzstan", dialCode: "996" },
  { countryCode: "KH", label: "Cambodia", dialCode: "855" },
  { countryCode: "KI", label: "Kiribati", dialCode: "686" },
  { countryCode: "KM", label: "Comoros", dialCode: "269" },
  {
    countryCode: "KN",
    label: "Saint Kitts and Nevis",
    dialCode: "1-869",
  },
  {
    countryCode: "KP",
    label: "Korea, Democratic People's Republic of",
    dialCode: "850",
  },
  { countryCode: "KR", label: "Korea, Republic of", dialCode: "82" },
  { countryCode: "KW", label: "Kuwait", dialCode: "965" },
  { countryCode: "KY", label: "Cayman Islands", dialCode: "1-345" },
  { countryCode: "KZ", label: "Kazakhstan", dialCode: "7" },
  {
    countryCode: "LA",
    label: "Lao People's Democratic Republic",
    dialCode: "856",
  },
  { countryCode: "LB", label: "Lebanon", dialCode: "961" },
  { countryCode: "LC", label: "Saint Lucia", dialCode: "1-758" },
  { countryCode: "LI", label: "Liechtenstein", dialCode: "423" },
  { countryCode: "LK", label: "Sri Lanka", dialCode: "94" },
  { countryCode: "LR", label: "Liberia", dialCode: "231" },
  { countryCode: "LS", label: "Lesotho", dialCode: "266" },
  { countryCode: "LT", label: "Lithuania", dialCode: "370" },
  { countryCode: "LU", label: "Luxembourg", dialCode: "352" },
  { countryCode: "LV", label: "Latvia", dialCode: "371" },
  { countryCode: "LY", label: "Libya", dialCode: "218" },
  { countryCode: "MA", label: "Morocco", dialCode: "212" },
  { countryCode: "MC", label: "Monaco", dialCode: "377" },
  {
    countryCode: "MD",
    label: "Moldova, Republic of",
    dialCode: "373",
  },
  { countryCode: "ME", label: "Montenegro", dialCode: "382" },
  {
    countryCode: "MF",
    label: "Saint Martin (French part)",
    dialCode: "590",
  },
  { countryCode: "MG", label: "Madagascar", dialCode: "261" },
  { countryCode: "MH", label: "Marshall Islands", dialCode: "692" },
  {
    countryCode: "MK",
    label: "Macedonia, the Former Yugoslav Republic of",
    dialCode: "389",
  },
  { countryCode: "ML", label: "Mali", dialCode: "223" },
  { countryCode: "MM", label: "Myanmar", dialCode: "95" },
  { countryCode: "MN", label: "Mongolia", dialCode: "976" },
  { countryCode: "MO", label: "Macao", dialCode: "853" },
  {
    countryCode: "MP",
    label: "Northern Mariana Islands",
    dialCode: "1-670",
  },
  { countryCode: "MQ", label: "Martinique", dialCode: "596" },
  { countryCode: "MR", label: "Mauritania", dialCode: "222" },
  { countryCode: "MS", label: "Montserrat", dialCode: "1-664" },
  { countryCode: "MT", label: "Malta", dialCode: "356" },
  { countryCode: "MU", label: "Mauritius", dialCode: "230" },
  { countryCode: "MV", label: "Maldives", dialCode: "960" },
  { countryCode: "MW", label: "Malawi", dialCode: "265" },
  { countryCode: "MX", label: "Mexico", dialCode: "52" },
  { countryCode: "MY", label: "Malaysia", dialCode: "60" },
  { countryCode: "MZ", label: "Mozambique", dialCode: "258" },
  { countryCode: "NA", label: "Namibia", dialCode: "264" },
  { countryCode: "NC", label: "New Caledonia", dialCode: "687" },
  { countryCode: "NE", label: "Niger", dialCode: "227" },
  { countryCode: "NF", label: "Norfolk Island", dialCode: "672" },
  { countryCode: "NG", label: "Nigeria", dialCode: "234" },
  { countryCode: "NI", label: "Nicaragua", dialCode: "505" },
  { countryCode: "NL", label: "Netherlands", dialCode: "31" },
  { countryCode: "NO", label: "Norway", dialCode: "47" },
  { countryCode: "NP", label: "Nepal", dialCode: "977" },
  { countryCode: "NR", label: "Nauru", dialCode: "674" },
  { countryCode: "NU", label: "Niue", dialCode: "683" },
  { countryCode: "NZ", label: "New Zealand", dialCode: "64" },
  { countryCode: "OM", label: "Oman", dialCode: "968" },
  { countryCode: "PA", label: "Panama", dialCode: "507" },
  { countryCode: "PE", label: "Peru", dialCode: "51" },
  { countryCode: "PF", label: "French Polynesia", dialCode: "689" },
  { countryCode: "PG", label: "Papua New Guinea", dialCode: "675" },
  { countryCode: "PH", label: "Philippines", dialCode: "63" },
  { countryCode: "PK", label: "Pakistan", dialCode: "92" },
  { countryCode: "PL", label: "Poland", dialCode: "48" },
  {
    countryCode: "PM",
    label: "Saint Pierre and Miquelon",
    dialCode: "508",
  },
  { countryCode: "PN", label: "Pitcairn", dialCode: "870" },
  { countryCode: "PR", label: "Puerto Rico", dialCode: "1" },
  {
    countryCode: "PS",
    label: "Palestine, State of",
    dialCode: "970",
  },
  { countryCode: "PT", label: "Portugal", dialCode: "351" },
  { countryCode: "PW", label: "Palau", dialCode: "680" },
  { countryCode: "PY", label: "Paraguay", dialCode: "595" },
  { countryCode: "QA", label: "Qatar", dialCode: "974" },
  { countryCode: "RE", label: "Reunion", dialCode: "262" },
  { countryCode: "RO", label: "Romania", dialCode: "40" },
  { countryCode: "RS", label: "Serbia", dialCode: "381" },
  { countryCode: "RU", label: "Russian Federation", dialCode: "7" },
  { countryCode: "RW", label: "Rwanda", dialCode: "250" },
  { countryCode: "SA", label: "Saudi Arabia", dialCode: "966" },
  { countryCode: "SB", label: "Solomon Islands", dialCode: "677" },
  { countryCode: "SC", label: "Seychelles", dialCode: "248" },
  { countryCode: "SD", label: "Sudan", dialCode: "249" },
  { countryCode: "SE", label: "Sweden", dialCode: "46" },
  { countryCode: "SG", label: "Singapore", dialCode: "65" },
  { countryCode: "SH", label: "Saint Helena", dialCode: "290" },
  { countryCode: "SI", label: "Slovenia", dialCode: "386" },
  {
    countryCode: "SJ",
    label: "Svalbard and Jan Mayen",
    dialCode: "47",
  },
  { countryCode: "SK", label: "Slovakia", dialCode: "421" },
  { countryCode: "SL", label: "Sierra Leone", dialCode: "232" },
  { countryCode: "SM", label: "San Marino", dialCode: "378" },
  { countryCode: "SN", label: "Senegal", dialCode: "221" },
  { countryCode: "SO", label: "Somalia", dialCode: "252" },
  { countryCode: "SR", label: "Suriname", dialCode: "597" },
  { countryCode: "SS", label: "South Sudan", dialCode: "211" },
  {
    countryCode: "ST",
    label: "Sao Tome and Principe",
    dialCode: "239",
  },
  { countryCode: "SV", label: "El Salvador", dialCode: "503" },
  {
    countryCode: "SX",
    label: "Sint Maarten (Dutch part)",
    dialCode: "1-721",
  },
  {
    countryCode: "SY",
    label: "Syrian Arab Republic",
    dialCode: "963",
  },
  { countryCode: "SZ", label: "Swaziland", dialCode: "268" },
  {
    countryCode: "TC",
    label: "Turks and Caicos Islands",
    dialCode: "1-649",
  },
  { countryCode: "TD", label: "Chad", dialCode: "235" },
  {
    countryCode: "TF",
    label: "French Southern Territories",
    dialCode: "262",
  },
  { countryCode: "TG", label: "Togo", dialCode: "228" },
  { countryCode: "TH", label: "Thailand", dialCode: "66" },
  { countryCode: "TJ", label: "Tajikistan", dialCode: "992" },
  { countryCode: "TK", label: "Tokelau", dialCode: "690" },
  { countryCode: "TL", label: "Timor-Leste", dialCode: "670" },
  { countryCode: "TM", label: "Turkmenistan", dialCode: "993" },
  { countryCode: "TN", label: "Tunisia", dialCode: "216" },
  { countryCode: "TO", label: "Tonga", dialCode: "676" },
  { countryCode: "TR", label: "Turkey", dialCode: "90" },
  {
    countryCode: "TT",
    label: "Trinidad and Tobago",
    dialCode: "1-868",
  },
  { countryCode: "TV", label: "Tuvalu", dialCode: "688" },
  {
    countryCode: "TW",
    label: "Taiwan",
    dialCode: "886",
  },
  {
    countryCode: "TZ",
    label: "United Republic of Tanzania",
    dialCode: "255",
  },
  { countryCode: "UA", label: "Ukraine", dialCode: "380" },
  { countryCode: "UG", label: "Uganda", dialCode: "256" },
  {
    countryCode: "US",
    label: "United States",
    dialCode: "1",
    suggested: true,
  },
  { countryCode: "UY", label: "Uruguay", dialCode: "598" },
  { countryCode: "UZ", label: "Uzbekistan", dialCode: "998" },
  {
    countryCode: "VA",
    label: "Holy See (Vatican City State)",
    dialCode: "379",
  },
  {
    countryCode: "VC",
    label: "Saint Vincent and the Grenadines",
    dialCode: "1-784",
  },
  { countryCode: "VE", label: "Venezuela", dialCode: "58" },
  {
    countryCode: "VG",
    label: "British Virgin Islands",
    dialCode: "1-284",
  },
  {
    countryCode: "VI",
    label: "US Virgin Islands",
    dialCode: "1-340",
  },
  { countryCode: "VN", label: "Vietnam", dialCode: "84" },
  { countryCode: "VU", label: "Vanuatu", dialCode: "678" },
  { countryCode: "WF", label: "Wallis and Futuna", dialCode: "681" },
  { countryCode: "WS", label: "Samoa", dialCode: "685" },
  { countryCode: "XK", label: "Kosovo", dialCode: "383" },
  { countryCode: "YE", label: "Yemen", dialCode: "967" },
  { countryCode: "YT", label: "Mayotte", dialCode: "262" },
  { countryCode: "ZA", label: "South Africa", dialCode: "27" },
  { countryCode: "ZM", label: "Zambia", dialCode: "260" },
  { countryCode: "ZW", label: "Zimbabwe", dialCode: "263" },
];
