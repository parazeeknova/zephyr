export const SUPPORT_TYPES = [
  { value: 'help', label: 'Help Request' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'other', label: 'Other' },
] as const;

export const CATEGORIES = [
  { value: 'account', label: 'Account Issues' },
  { value: 'technical', label: 'Technical Problems' },
  { value: 'feature', label: 'Feature Requests' },
  { value: 'billing', label: 'Billing Questions' },
  { value: 'security', label: 'Security Concerns' },
] as const;

export const PRIORITIES = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical' },
] as const;
