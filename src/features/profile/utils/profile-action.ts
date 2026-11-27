import { toast } from '@/components/custom/toast';
import {
  getProfileErrorMessage,
  type ProfileErrorOperation,
} from '../api/profile-error';

export async function runProfileAction<T>(
  action: () => Promise<T>,
  options: {
    operation: ProfileErrorOperation;
    errorTitle: string;
    successMessage?: string;
    onSuccess?: (result: T) => void;
    onError?: () => void;
  },
): Promise<boolean> {
  try {
    const result = await action();
    options.onSuccess?.(result);
    if (options.successMessage) {
      toast.success(options.successMessage);
    }
    return true;
  } catch (error) {
    options.onError?.();
    const message = getProfileErrorMessage(error, options.operation);
    if (message) {
      toast.error(options.errorTitle, { description: message });
    }
    return false;
  }
}
