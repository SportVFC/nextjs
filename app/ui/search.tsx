// "use client" - This is a Client Component, which means you can use event listeners and hooks.
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
/*
Now that you have the query string. You can use Next.js's useRouter and usePathname hooks to update the URL.

Import useRouter and usePathname from 'next/navigation', and use the replace method from useRouter() inside handleSearch:
*/
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

/*
Debouncing is a programming practice that limits the rate at which a function can fire. In our case, 
you only want to query the database when the user has stopped typing.

How Debouncing Works:

Trigger Event: When an event that should be debounced (like a keystroke in the search box) occurs, a timer starts.
Wait: If a new event occurs before the timer expires, the timer is reset.
Execution: If the timer reaches the end of its countdown, the debounced function is executed.
*/
import { useDebouncedCallback } from 'use-debounce';


export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // old function handleSearch(term: string) {

  /*
  Au lieu de récupérer le texte à chaque saisie du clavier comme ceci :
    Searching... D
    Searching... De
    Searching... Del
    Searching... Delb
    Searching... Delba

  avec Debouncing, on récupère uniquement le dernier mot : 
    Searching... Delba
  */
  const handleSearch = useDebouncedCallback((term) => {
    //console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    /*
      Here's a breakdown of what's happening:

      ${pathname} is the current path, in your case, "/dashboard/invoices".

      As the user types into the search bar, params.toString() translates this input into a URL-friendly format.
      replace(${pathname}?${params.toString()}) updates the URL with the user's search data. For example, 
      /dashboard/invoices?query=lee if the user searches for "Lee".

      The URL is updated without reloading the page, thanks to Next.js's client-side navigation (which you 
      learned about in the chapter on navigating between pages.
    */
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  /*
  To ensure the input field is in sync with the URL and will be populated when sharing, 
  you can pass a defaultValue to input by reading from searchParams 

  */
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}

        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
