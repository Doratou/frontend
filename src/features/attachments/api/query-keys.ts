export const attachmentKeys = {
  all: ['attachments'] as const,
  detail: (attachmentId: string) =>
    [...attachmentKeys.all, 'detail', attachmentId] as const,
};
