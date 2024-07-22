import Form from '@/app/ui/inputjobs/create-ameriflux-form';
import Breadcrumbs from '@/app/ui/inputjobs/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  const customers = await fetchCustomers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Files', href: '/dashboard/inputjobs' },
          {
            label: 'Create File',
            href: '/dashboard/inputjobs/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}