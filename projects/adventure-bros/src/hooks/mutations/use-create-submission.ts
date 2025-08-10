import type { CreateSubmissionRequest } from '@/backend/api/submission-routes';
import { useMutation } from '@tanstack/react-query';

export function useCreateSubmission(submission: CreateSubmissionRequest) {
  return useMutation<CreateSubmissionRequest>({
    mutationFn: async () => {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(submission),
      });

      if (!res.ok) {
        throw new Error('Unable to process response');
      }

      return (await res.json()) as CreateSubmissionRequest;
    },
  });
}
