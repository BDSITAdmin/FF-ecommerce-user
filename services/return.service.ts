import api from "./api";

export const createReturnRequest = (payload: FormData) => {
    return api.post("/api/v1/returns", payload, {
        headers: {
            Accept: "application/json",
        },
    });
};
