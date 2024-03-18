import { Card } from "@/app/ui/dashboard/cards";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import { lusitana } from "@/app/ui/font";
import {
  fetchCardData,
  fetchLatestInvoices,
  fetchRevenue,
} from "../../lib/data";
import { Suspense } from "react";
import { RevenueChartSkeleton } from "@/app/ui/skeletons";

export default async function Page() {
  const latestInvoices = await fetchLatestInvoices();

  // 추가
  const {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/**
         * 이전 코드: Suspense가 없기 때문에, 컴포넌트 별 스트리밍이 이루어지지 않음.
         * 즉, 페이지 전체가 차단되고, fetchLatestInvoices(), fetchCardData(), fetchRevenue()가 모두 수행되어야 화면을 볼 수 있다.
         */}
        {/* <RevenueChart /> */}

        {/**
         * 변경 코드: Suspense가 있기 때문에, 컴포넌트 별 스트리밍이 이루어짐.
         * 페이지 전체가 차단되지 않고, fetchLatestInvoices(), fetchCardData()가 수행되면 페이지를 확인할 수 있다.
         * children props 내에서 별도로 데이터를 요청하는 함수인 fetchRevenue()가 모두 수행되기 전에는 해당 컴포넌트 출력 영역에 fallback 컴포넌트가 표시되며, 모두 수행되고 나면 children props로 전달한 컴포넌트 화면을 볼 수 있다.
         */}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
