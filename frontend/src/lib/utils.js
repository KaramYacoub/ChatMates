import { LANGUAGE_TO_FLAG } from "../constants/constants-index";

export function capitialize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  }

  return null;
}
