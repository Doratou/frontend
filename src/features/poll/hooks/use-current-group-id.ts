// shortcut: the poll route does not carry a group id yet.
// Replace the body once the group route (or a store) is decided;
// every poll component reads the id only through this hook.
export function useCurrentGroupId(): string {
  return 'preview-group';
}
