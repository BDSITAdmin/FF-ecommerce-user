import OrderSuccess from "./OrderSuccess";

export default function Page({ searchParams }: { searchParams: { orderId?: string } }) {
  return <OrderSuccess orderId={searchParams.orderId || ""} />;
}