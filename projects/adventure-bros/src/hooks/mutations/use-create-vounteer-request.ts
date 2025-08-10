import type { CreateVolunteerRequest } from "@/backend/api/volunteer-routes";
import { useMutation } from "@tanstack/react-query";

export function useCreateVolunteerRequest(request: CreateVolunteerRequest) {
    return useMutation<CreateVolunteerRequest>({
        mutationFn:  async () => {
            const res = await fetch("/api/volunteer", {
                method: "POST",
                body: JSON.stringify(request)
            })

            if (!res.ok) {
                throw new Error('Unable to process response')
            }

            return await res.json() as CreateVolunteerRequest;
        }
    })
}