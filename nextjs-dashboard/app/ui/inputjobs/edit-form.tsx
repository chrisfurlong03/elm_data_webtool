'use client';
import React, { useState } from 'react';
import { useFormState } from 'react-dom';
import { updateInputJob, fetchNCFile } from '@/app/lib/actions';
import { CustomerField, InputJobForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import LoadData from './loaddata';

export default function EditInputJobForm({
  inputjob,
  customers,
}: {
  inputjob: InputJobForm;
  customers: CustomerField[];
}) {
  const initialState = { message: null, errors: {} };
  const updateInputJobWithId = updateInputJob.bind(null, inputjob.id);
  const [state, formAction] = useFormState(updateInputJobWithId, initialState);
  const [showLoadData, setShowLoadData] = useState(false);

  const handleDownload = async () => {
    try {
      const ncfileString = await fetchNCFile(inputjob.id);
      const url = ncfileString?.downloadUrl ?? 'defaultUrl';
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `inputjob_${inputjob.id}.nc`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateInputJobWithId(state, formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */}
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            User
          </label>
          <div className="relative">
            <select
              disabled
              id="customer"
              name="customerId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={inputjob.customer_id}
            >
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Invoice Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Start year
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                disabled
                id="startdt"
                name="startdt"
                type="number"
                step="0.01"
                defaultValue={inputjob.startdt}
                placeholder="Enter start year"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset disabled>
          <legend className="mb-2 block text-sm font-medium">
            The input job status
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={inputjob.status === 'pending'}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
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
                  defaultChecked={inputjob.status === 'ready'}
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
        </fieldset>
      </div>


      {/* Download button */}
      <button
        type="button"
        className="mt-4 rounded-md bg-green-500 py-2 px-4 text-white"
        onClick={handleDownload}
      >
        Download .nc File
      </button>
    </form>
  );
}
