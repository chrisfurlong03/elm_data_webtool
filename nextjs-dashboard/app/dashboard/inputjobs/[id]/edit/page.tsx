import Form from '@/app/ui/inputjobs/edit-form';
import Tools from '@/app/ui/inputjobs/edit-tools';
import Breadcrumbs from '@/app/ui/inputjobs/breadcrumbs';
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
      <div className='mb-4' />
      {inputjob.status === 'ready' &&  <Tools inputjob={inputjob} customers={customers} />}
    </main>
  );
}