'use client';
/*
* used by dashboard/inputjobs/[id]/edit
* Edit form only shows status and cannot be edited.
*/
import React, { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { updateInputJob, pendingStatus } from '@/app/lib/actions';
import { CustomerField, InputJobForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';

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

  const [status, setStatus] = useState(null);

  const fetchStatus = async () => {
    const result = await pendingStatus(inputjob.id);
    setStatus(result);
  };
  useEffect(() => {
    // Fetch status initially
    fetchStatus();
    // Set up polling to check for status changes every 10 seconds
    const interval = setInterval(fetchStatus, 3000);
    // Cleanup interval on component unmount
    if (status === 'ready') {
      clearInterval(interval);
      window.location.reload();
    };
  }, []);
  
  
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Invoice Status */}
        <fieldset disabled>
          <legend className="mb-2 block text-sm font-medium">
            The input job status
          </legend>
          <div className={`rounded-md border border-gray-200 bg-white px-[14px] py-3`}>
            <div className="flex gap-4">
              <div className={`flex items-center`}>
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={inputjob.status === 'pending'}
                  className={`h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 ${inputjob.status === 'pending' ? 'animate-spin outline-dashed outline-2 outline-offset-2' : ''}`}
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
      <div className="mt-6 flex justify-end gap-4">
          <Button type="submit">Finalize Input Job</Button>
      </div>
    </form>
  );
}
