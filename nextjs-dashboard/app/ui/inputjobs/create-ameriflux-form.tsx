'use client';

import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  HashtagIcon,
  UserCircleIcon,
  CalendarIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createInputJobAFlx, ELMState } from '@/app/lib/actions';
import { useFormState } from 'react-dom';


export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState: ELMState = { message: null, errors: {} };
  const [state, formAction] = useFormState(createInputJobAFlx, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Site Code */}
        <div className="mb-4">
          <label htmlFor="site" className="mb-2 block text-sm font-medium">
            Choose a site code
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="site"
                name="site"
                type="string"
                placeholder="Enter site"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="start-error"
              />
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="site-error" aria-live="polite" aria-atomic="true">
            {state.errors?.site &&
              state.errors.site.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>        

        {/* Start Year */}
        <div className="mb-4">
          <label htmlFor="startdt" className="mb-2 block text-sm font-medium">
            Choose a start year
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="startdt"
                name="startdt"
                type="number"
                step="1"
                placeholder="Enter start year"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="start-error"
              />
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="startdt-error" aria-live="polite" aria-atomic="true">
            {state.errors?.startdt &&
              state.errors.startdt.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* End Year */}
        <div className="mb-4">
          <label htmlFor="enddt" className="mb-2 block text-sm font-medium">
            Choose an end year
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="enddt"
                name="enddt"
                type="number"
                step="1"
                placeholder="Enter end year"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="enddt-error"
              />
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="enddt-error" aria-live="polite" aria-atomic="true">
            {state.errors?.enddt &&
              state.errors.enddt.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>


        <div aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/inputjobs"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Input Job</Button>
      </div>
    </form>
  );
}
