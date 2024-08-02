'use client';
import { useState } from 'react';
import { fetchNCFile } from '@/app/lib/actions';
import TemperatureChart from '@/app/ui/inputjobs/tempchart'
import { CustomerField, InputJobForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function EditInputJobForm({
  inputjob,
  customers,
}: {
  inputjob: InputJobForm;
  customers: CustomerField[];
}) {
  const [showChart, setShowChart] = useState(null);

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
  
  return (
    <div>
    <div className="rounded-md bg-gray-50 p-4 md:p-6">
      <div className="mt-6 flex gap-4">
        {/* Display a button to show the loaddate component */}
        <Button
          type="button"
          className="mt-4 rounded-md bg-lime-500 py-2 px-4"
          onClick={() => {showChart != 'PPFD_OUT' ? setShowChart('PPFD_OUT') :  setShowChart(null)}}
        >
          {showChart === 'PPFD_OUT' ? 'Hide PPFD_OUT Chart' : 'PPFD_OUT Chart'}
        </Button>
        <Button
          type="button"
          className="mt-4 rounded-md bg-lime-500 py-2 px-4"
          onClick={() => {showChart != 'TA' ? setShowChart('TA') :  setShowChart(null)}}
        >
          {showChart === 'TA' ? 'Hide TA Chart' : 'TA Chart'}
        </Button>
        <Button
          type="button"
          className="mt-4 rounded-md bg-lime-500 py-2 px-4"
          onClick={() => {showChart != 'PA' ? setShowChart('PA') :  setShowChart(null)}}
        >
          {showChart === 'PA' ? 'Hide PA Chart' : 'PA Chart'}
        </Button>
        <Button
          type="button"
          className="mt-4 rounded-md bg-lime-500 py-2 px-4"
          onClick={() => {showChart != 'RH' ? setShowChart('RH') :  setShowChart(null)}}
        >
          {showChart === 'RH' ? 'Hide RH Chart' : 'RH Chart'}
        </Button>
        <Button
          type="button"
          className="mt-4 rounded-md bg-lime-500 py-2 px-4"
          onClick={() => {showChart != 'WS' ? setShowChart('WS') :  setShowChart(null)}}
        >
          {showChart === 'WS' ? 'Hide WS Chart' : 'WS Chart'}
        </Button>
        <Button
          type="button"
          className="mt-4 rounded-md bg-lime-500 py-2 px-4"
          onClick={() => {showChart != 'P' ? setShowChart('P') :  setShowChart(null)}}
        >
          {showChart === 'P' ? 'Hide P Chart' : 'P Chart'}
        </Button>
      </div>
        {showChart === 'TA' && <TemperatureChart data={JSON.parse(inputjob.data).TA} dataLable='TA (temperature)' title='TA Over Time in 2016' ytitle='Temperature (TA)' />}
        {showChart === 'RH' && <TemperatureChart data={JSON.parse(inputjob.data).RH} />}
        {showChart === 'WS' && <TemperatureChart data={JSON.parse(inputjob.data).WS} />}
        {showChart === 'PPFD_OUT' && <TemperatureChart data={JSON.parse(inputjob.data).PPFD_OUT} />}
        {showChart === 'P' && <TemperatureChart data={JSON.parse(inputjob.data).P} />}     
        {showChart === 'PA' && <TemperatureChart data={JSON.parse(inputjob.data).PA} />}  
    </div>
          <div className="rounded-md bg-gray-50 p-4 mt-4 md:p-6">
          <Button
              type="button"
              onClick={handleDownload}
            >
              Download .nc File
          </Button>      
        </div>
    </div>
  );
}

