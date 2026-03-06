import { useEffect, useState } from "react";
import api from "@/services/api";

export const useProducts = (limit = 40) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/api/v1/products", {
            params: {
                page: 1,
                limit,
                sortBy: "createdAt",
                sortOrder: "desc",
            },
        })
            .then(res => {
                setProducts(res?.data?.data?.products ?? []);
            })
            .finally(() => setLoading(false));
    }, [limit]);

    return { products, loading };
};