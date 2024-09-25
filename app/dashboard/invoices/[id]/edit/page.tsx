import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  // Promise.all을 사용하여 인보이스와 고객 데이터를 동시에 가져옴
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id), // 특정 인보이스 데이터를 가져옴
    fetchCustomers(), // 고객 데이터를 가져옴
  ]);

  if (!invoice) notFound();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Invoices", href: "/dashboard/invoices" },
          {
            label: "Edit Invoice",
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
