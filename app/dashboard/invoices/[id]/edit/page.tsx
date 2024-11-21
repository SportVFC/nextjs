import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

/*
Now that you know the invoice doesn't exist in your database, let's use notFound to handle it. 
Navigate to /dashboard/invoices/[id]/edit/page.tsx, and import { notFound } from 'next/navigation'.

Then, you can use a conditional to invoke notFound if the invoice doesn't exist:
*/
import { notFound } from 'next/navigation';
/*
In addition to searchParams, page components also accept a prop called params which you can use to access the id. 
Update your <Page> component to receive the prop:
*/
export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    // Fetch the specific invoice
    // Import a new function called fetchInvoiceById and pass the id as an argument.
    // Import fetchCustomers to fetch the customer names for the dropdown.
    // --> You can use Promise.all to fetch both the invoice and customers in parallel:
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);    

    if (!invoice) {
        notFound();
      }

    return (
        <main>
        <Breadcrumbs
            breadcrumbs={[
            { label: 'Invoices', href: '/dashboard/invoices' },
            {
                label: 'Edit Invoice',
                href: `/dashboard/invoices/${id}/edit`,
                active: true,
            },
            ]}
        />
        <Form invoice={invoice} customers={customers} />
        </main>
    );
}