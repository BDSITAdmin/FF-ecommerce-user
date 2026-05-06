import api from "./api";

export const createReturnRequest = (payload: FormData) => {
    return api.post("/api/v1/returns", payload, {
        headers: {
            Accept: "application/json",
        },
    });
};

export const getUserReturns = (
    userId: string,
    params?: { page?: number; limit?: number }
) => {
    return api.get(`/api/v1/returns/user/${userId}`, {
        params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
        },
    });
};
