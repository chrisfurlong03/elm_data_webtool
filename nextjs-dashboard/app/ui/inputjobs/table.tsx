/*
* Table UI for dashboard/inputjobs/
*/

import Image from 'next/image';
import { UpdateInputJob, DeleteInputJob } from '@/app/ui/inputjobs/buttons';
import InvoiceStatus from '@/app/ui/inputjobs/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredInputJobs } from '@/app/lib/data';

export default async function InputJobsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const inputjobs = await fetchFilteredInputJobs(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {inputjobs?.map((inputjob) => (
              <div
                key={inputjob.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={inputjob.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${inputjob.name}'s profile picture`}
                      />
                      <p>{inputjob.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{inputjob.email}</p>
                  </div>
                  <InvoiceStatus status={inputjob.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>{formatDateToLocal(inputjob.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInputJob id={inputjob.id} />
                    <DeleteInputJob id={inputjob.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  User
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {inputjobs?.map((inputjob) => (
                <tr
                  key={inputjob.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={inputjob.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${inputjob.name}'s profile picture`}
                      />
                      <p>{inputjob.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {inputjob.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(inputjob.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <InvoiceStatus status={inputjob.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInputJob id={inputjob.id} />
                      <DeleteInputJob id={inputjob.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
