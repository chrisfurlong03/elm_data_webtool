import React, { useEffect, useState } from 'react';
import { takeInputs } from '@/app/lib/actions';
import { CustomerField, InvoiceForm } from '@/app/lib/definitions';


function LoadData({
    invoice,
    customers,
  }: {
    invoice: InvoiceForm;
    customers: CustomerField[];
  }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Assuming you have the `req` object ready or you can define it as per your requirements
    const req = {
      lat: invoice.lat,
      lon: invoice.lon,
      startYear: invoice.startdt,
      endYear: invoice.enddt
    };
    takeInputs(req)
      .then(result => {
        setData(result);
      })
      .catch(error => {
        console.error('Failed to load data', error);
      });
  }, []);

  return (
    <div>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default LoadData;