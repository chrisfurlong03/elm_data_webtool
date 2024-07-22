import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image'
import { deleteInputJob } from '@/app/lib/actions';

export function CreateInputJob() {
  return (
    <Link
      href="/dashboard/inputjobs/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create File</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CreateInputJobAFlx() {
  return (
    <Link
      href="/dashboard/inputjobs/create-ameriflux"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create with AmeriFlux</span>{' '}
      <Image
        src="/ameriflux.png"
        className="rounded-full md:ml-4"
        width={25}
        height={25}
        alt={`ameriflux logo`}
      />
    </Link>
  );
}

export function UpdateInputJob({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/inputjobs/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInputJob({ id }: { id: string }) {
  const deleteInputJobWithId = deleteInputJob.bind(null, id);
 
  return (
    <form action={deleteInputJobWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-4" />
      </button>
    </form>
  );
}