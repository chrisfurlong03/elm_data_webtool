'use client';

import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  HashtagIcon, 
  UserCircleIcon,
  CalendarIcon,
  DocumentIcon
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
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose user
          </label>
          <div className="relative">
            <select
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="customer-error"
            >
              <option value="" disabled>
                Select a user
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>

          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.customerId &&
              state.errors.customerId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Lat */}
        <div className="mb-4">
          <label htmlFor="lat" className="mb-2 block text-sm font-medium">
            Choose a latitude
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="lat"
                name="lat"
                type="number"
                step="0.01"
                placeholder="Enter latitude"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="lat-error"
              />
              <HashtagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="lat-error" aria-live="polite" aria-atomic="true">
            {state.errors?.lat &&
              state.errors.lat.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Lon */}
        <div className="mb-4">
          <label htmlFor="lon" className="mb-2 block text-sm font-medium">
            Choose a longitude
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="lon"
                name="lon"
                type="number"
                step="0.01"
                placeholder="Enter longitude"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="lon-error"
              />
              <HashtagIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="lon-error" aria-live="polite" aria-atomic="true">
            {state.errors?.lon &&
              state.errors.lon.map((error: string) => (
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

        {/* File Upload */}
        <div className="mb-4">
          <label htmlFor="data" className="mb-2 block text-sm font-medium">
            Upload JSON File
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="data"
                name="data"
                type="file"
                accept="application/json"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="data-error"
              />
              <DocumentIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          <div id="data-error" aria-live="polite" aria-atomic="true">
            {state.errors?.data &&
              state.errors.data.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the file status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="text-white-600 h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="ready"
                  name="status"
                  type="radio"
                  value="ready"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="ready"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Ready <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>

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

