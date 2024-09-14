'use client';
/*
* Rendered when the ncfile is available.
* used by dashboard/inputjobs/[id]/edit
* Renders charts and a download feature.
*/
import { useState } from 'react';
import { fetchNCFile } from '@/app/lib/actions';
import TemperatureChart from '@/app/ui/inputjobs/tempchart'
import {  InputJobForm } from '@/app/lib/definitions';
import { Button } from '@/app/ui/button';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function EditInputJobForm({
  inputjob,
}: {
  inputjob: InputJobForm;
}) {
  const [showChart, setShowChart] = useState<string | null>(null);

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
          onClick={() => {showChart != 'H2O' ? setShowChart('H2O') :  setShowChart(null)}}
        >
          {showChart === 'H2O' ? 'Hide H2O Chart' : 'H2O Chart'}
        </Button>
      </div>
        {showChart === 'TA' && <TemperatureChart data={JSON.parse(inputjob.data).TA} dataLable='TA (temperature, C)' title='TA Over Time' ytitle='Temperature (TA)' tStepDay={inputjob.time_step_day} />}
        {showChart === 'RH' && <TemperatureChart data={JSON.parse(inputjob.data).RH} dataLable='RH (relative humidity, %)' title='RH Over Time' ytitle='Relative Humidity (RH)' tStepDay={inputjob.time_step_day} />}
        {showChart === 'WS' && <TemperatureChart data={JSON.parse(inputjob.data).WS} dataLable='WS (wind speed, m/s)' title='WS Over Time' ytitle='Wind Speed (WS)' tStepDay={inputjob.time_step_day} />}
        {showChart === 'PPFD_OUT' && <TemperatureChart data={JSON.parse(inputjob.data).PPFD_OUT} dataLable='PPFD_OUT (outgoing PPFD, µmol Photon/m^2/s)' title='PPFD_OUT' ytitle='Outgoing Radiation (PPFD)' tStepDay={inputjob.time_step_day} />}
        {showChart === 'H2O' && <TemperatureChart data={JSON.parse(inputjob.data).H2O} dataLable='Precipitation (precipitation, kg/m^2/s)' title='Precipitation' ytitle='Precipitation (H2O)' tStepDay={inputjob.time_step_day} />}     
        {showChart === 'PA' && <TemperatureChart data={JSON.parse(inputjob.data).PA} dataLable='PA (pressure, Pa)' title='PA Over Time' ytitle='Pressure (PA)' tStepDay={inputjob.time_step_day} />}  
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

