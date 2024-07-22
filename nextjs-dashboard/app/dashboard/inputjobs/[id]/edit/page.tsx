import Form from '@/app/ui/inputjobs/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInputJobById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';


export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [inputjob, customers] = await Promise.all([
    fetchInputJobById(id),
    fetchCustomers(),
  ]);
  if (!inputjob) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Files', href: '/dashboard/inputjobs' },
          {
            label: 'Edit File',
            href: `/dashboard/inputjobs/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form inputjob={inputjob} customers={customers} />
    </main>
  );
}