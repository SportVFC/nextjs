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

/* for auth */
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

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
/* old
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),

    // The amount field is specifically set to coerce (change) from a string to a number while also validating its type.
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });
  */

  // update Server-Side validation
  /*
  // Step 1
  - customerId - Zod already throws an error if the customer field is empty as it expects a type string. But let's add a 
  friendly message if the user doesn't select a customer.
  - amount - Since you are coercing the amount type from string to number, it'll default to zero if the string is empty. 
  Let's tell Zod we always want the amount greater than 0 with the .gt() function.
  - status - Zod already throws an error if the status field is empty as it expects "pending" or "paid". Let's also add 
  a friendly message if the user doesn't select a status.
  */
  const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
              invalid_type_error: 'Please select a customer.', // message d'erreur affiché si formulaire non valide
            }),
    amount: z.coerce
            .number()
            .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
              invalid_type_error:  'Please select an invoice status.', 
            }),
    date: z.string(),
  });

  // Step 2
  // Next, update your createInvoice action to accept two parameters - prevState and formData:
  export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Step 3 --> Add "prevState: State"
// formData - same as before.
// prevState - contains the state passed from the useActionState hook. You won't be using 
// it in the action in this example, but it's a required prop.
export async function createInvoice(prevState: State, formData: FormData) {

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
    /*const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    */

    // Validate form fields using Zod
    // Step 3 : Then, change the Zod parse() function to safeParse():
    /*
    safeParse() will return an object containing either a success or error field. 
    This will help handle validation more gracefully without having put this logic inside the try/catch block.
    */
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Step 4
    // Before sending the information to your database, check if the form fields were validated correctly with a conditional:
    // If form validation fails, return errors early. Otherwise, continue.
    // If validatedFields isn't successful, we return the function early with the error messages from Zod.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }    
    
    // Let's convert the amount into cents:
    // const amountInCents = amount * 100;

    // Creating new dates
    // const date = new Date().toISOString().split('T')[0];

    // Step 5
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];    

    // Inserting the data into your database
    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }


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

  // Use Zod to update the expected types
  export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
  ) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }
   
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    try {
      await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Invoice.' };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }
/**
Since this action is being called in the /dashboard/invoices path, you don't need to call redirect. 
Calling revalidatePath will trigger a new server request and re-render the table

Nous sommmes et restons sur la même page.
 */
  export async function deleteInvoice(id: string) {
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return { message: 'Deleted Invoice.' };
    } 
    catch (error) {
      return { message: 'Database Error: Failed to Delete Invoice.' };
    }
  }


/*
Now you need to connect the auth logic with your login form. In your actions.ts file, create a new action called authenticate. 
This action should import the signIn function from auth.ts:

If there's a 'CredentialsSignin' error, you want to show an appropriate error message. 
You can learn about NextAuth.js errors in the documentation

see https://nextjs.org/learn/dashboard-app/adding-authentication
*/
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}