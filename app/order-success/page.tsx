import OrderSuccess from "./OrderSuccess";

type SearchParams = { orderId?: string };

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: SearchParams | Promise<SearchParams>;
}>) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  return <OrderSuccess orderId={resolvedSearchParams?.orderId || ""} />;
}