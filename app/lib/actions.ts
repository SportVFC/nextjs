/**
 * Create a Server Action
 * 
 * By adding the 'use server', you mark all the exported functions within the file as Server Actions. 
 * These server functions can then be imported and used in Client and Server components.
 * 
 * You can also write Server Actions directly inside Server Components by adding "use server" inside the action. 
 * But for this course, we'll keep them all organized in a separate file.
 */
'use server';

/*
in /app/lib/definitions.ts
export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid';
};
and So far, you only have the customer_id, amount, and status from the form.

-> with console.log(typeof rawFormData.amount); -> not a number

You'll notice that amount is of type string and not number. This is because input 
elements with type="number" actually return a string, not a number!

To handle type validation, you have a few options. While you can manually validate types, using a type validation 
library can save you time and effort. For your example, we'll use Zod, a TypeScript-first validation library that 
can simplify this task for you.
*/
import { z } from 'zod';
import { sql } from '@vercel/postgres'; // Inserting the data into your database

/*
Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time. Along with 
prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests 
made to the server.

Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request 
to the server. You can do this with the revalidatePath function from Next.js:
*/
import { revalidatePath } from 'next/cache';// Revalidate and redirect

/*
you also want to redirect the user back to the /dashboard/invoices page. You can do this with the redirect function 
from Next.js:
*/
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),

    // The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });
  
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {

    // Extract the data from formData -> get(name)
    /**
     * you'll need to extract the values of formData, there are a couple of methods you can use. 
     * For this example, let's use the .get(name) method.
     */
    /*
    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    };
    */
    
    // You can then pass your rawFormData to CreateInvoice to validate the types:
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    // Let's convert the amount into cents:
    const amountInCents = amount * 100;

    // Creating new dates
    const date = new Date().toISOString().split('T')[0];

    // Inserting the data into your database
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

    // Test it out:
    //console.log(rawFormData);
    //console.log(typeof rawFormData.amount);
    /**
    {
        customerId: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9',
        amount: '80',
        status: 'pending'
    }
     */
  }



  // Use Zod to update the expected types
  const UpdateInvoice = FormSchema.omit({ id: true, date: true });

  export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    const amountInCents = amount * 100;
   
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

/**
Since this action is being called in the /dashboard/invoices path, you don't need to call redirect. 
Calling revalidatePath will trigger a new server request and re-render the table

Nous sommmes et restons sur la même page.
 */
  export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  }