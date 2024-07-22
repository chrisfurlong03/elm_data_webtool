'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import axios from 'axios';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as readline from 'readline';
import { Buffer } from 'buffer';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

 
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  lat: z.coerce.number().min(14.5, { message: 'Latitude must be greater than or equal to 14.5' }).max(52.0, { message: 'Latitude must be less than or equal to 52.0' }),
  lon: z.coerce.number().min(-131.0, { message: 'Longitude must be greater than or equal to -131.0' }).max(-53.0, { message: 'Longitude must be less than or equal to -53.0' }),
  startdt: z.coerce.number().gt(0, { message: 'Please enter a year.' }),
  enddt: z.coerce.number().gt(0, { message: 'Please enter a year.' }),
  status: z.enum(['pending', 'ready'], {
    invalid_type_error: 'Please select a status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// New schema

const ELMFormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  lat: z.coerce.number().min(14.5, { message: 'Latitude must be greater than or equal to 14.5' }).max(52.0, { message: 'Latitude must be less than or equal to 52.0' }),
  lon: z.coerce.number().min(-131.0, { message: 'Longitude must be greater than or equal to -131.0' }).max(-53.0, { message: 'Longitude must be less than or equal to -53.0' }),
  startdt: z.coerce.number().gt(0, { message: 'Please enter a year.' }),
  enddt: z.coerce.number().gt(0, { message: 'Please enter a year.' }),
  data: z.string(),
  status: z.enum(['pending', 'ready'], {
    invalid_type_error: 'Please select a status.',
  }),
  date: z.string(),
});
 
const CreateInputJob = ELMFormSchema.omit({ id: true, date: true, data: true });
const UpdateInputJob = ELMFormSchema.omit({ id: true, date: true });

export type ELMState = {
  errors?: {
    customerId?: string[];
    lat?: string[];
    lon?: string[];
    startdt?: string[];
    enddt?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    startdt: formData.get('startdt'),
    enddt: formData.get('enddt'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, lat, lon, startdt, enddt, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const lonAbs = Math.abs(lon) * 100;
  const latCents = lat * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, lat, lon, startdt, enddt, status, date)
      VALUES (${customerId}, ${amountInCents}, ${latCents}, ${lonAbs}, ${startdt}, ${enddt}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInputJob(
  id: string,
  prevState: ELMState,
  formData: FormData,
) {
  const validatedFields = UpdateInputJob.safeParse({
    customerId: formData.get('customerId'),
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    startdt: formData.get('startdt'),
    enddt: formData.get('enddt'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, lat, lon, startdt, enddt, status } = validatedFields.data;
 
  try {
    await sql`
      UPDATE inputjob
      SET customer_id = ${customerId}, lat = ${lat}, lon = ${lon}, startdt = ${startdt}, enddt = ${enddt}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function deleteInputJob(id: string) {

  try {
    await sql`DELETE FROM inputjobs WHERE id = ${id}`;
    revalidatePath('/dashboard/inputjobs');
    return { message: 'Deleted Input Job.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Input Job.' };
  }
}


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}




// NEW



export async function takeInputs(req) {
  const { lat, lon, startYear, endYear } = req;

  const daymetUrl = `https://daymet.ornl.gov/single-pixel/api/data?lat=${lat}&lon=${lon}&vars=tmax,tmin,srad,vp,prcp,dayl&start=${startYear}-01-01&end=${endYear}-12-31`;

  try {
    const response = await axios.get(daymetUrl, {
      responseType: 'stream',
    });

    const jsonData = await csvToJson(response.data);

    // Process data
    console.log(jsonData)
    const processedData = await processData(jsonData);
    return processedData;
  } catch (error) {
    if (error.response && error.response.data) {
      return new Promise((resolve, reject) => {
        let errorMessage = '';
        error.response.data.on('data', (chunk) => {
          errorMessage += chunk.toString();
        });

        error.response.data.on('end', () => {
          resolve(errorMessage+"... No Daymet data for this location!");
        });

        error.response.data.on('error', (err) => {
          resolve(err);
        });
      });
    } else {
      return error.message;
    }
  }
}

async function csvToJson(stream: Readable): Promise<Record<string, Record<string, number>>> {
  const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
  });

  const lines: string[] = [];
  for await (const line of rl) {
      lines.push(line);
  }

  const headers = lines[6].split(",");
  const dataLines = lines.slice(7);

  const result: Record<string, Record<string, number>> = {};

  headers.slice(2).forEach(header => {
      result[header] = {};
  });

  dataLines.forEach(line => { 
      const values = line.split(",");
      const year = values[0];
      const yday = values[1];
      const key = `${year}_${yday}`;

      headers.slice(2).forEach((header, index) => {
          result[header][key] = parseFloat(values[index + 2]);
      });
  });

  return result;
}

export async function processData(data: any) {
  const outvars = ['TBOT', 'RH', 'WIND', 'PSRF', 'FSDS', 'PRECTmms'];
  const invars = ['tmax (deg c)', 'vp (Pa)', 'WS', 'srad (W/m^2)',  'prcp (mm/day)', 'dayl (s)'];
  const conversion = [1, 1, 1, 1000, 1 / (0.48 * 4.6), 1];

  const processedData = {};

  for (let i = 0; i < outvars.length; i++) {
    const outvar = outvars[i];
    const invar = invars[i];
    const conversionFactor = conversion[i];

    if (data[invar]) {
      processedData[outvar] = Object.values(data[invar]).map(value => value * conversionFactor);
    } else {
      console.warn(`Data for ${invar} is missing`);
      processedData[outvar] = [];
    }
  }

  return processedData;
}


// inputjobs database actions

export async function createInputJob(prevState: ELMState, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInputJob.safeParse({
    customerId: formData.get('customerId'),
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    startdt: formData.get('startdt'),
    enddt: formData.get('enddt'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Input Job.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, lat, lon, startdt, enddt, status } = validatedFields.data;
  const lonAbs = Math.abs(lon) * 100;
  const latCents = lat * 100;
  const date = new Date().toISOString().split('T')[0];
  const newReq = {
    lat: lat,
    lon: lon,
    startYear: startdt,
    endYear: enddt
  };
  const data = await takeInputs(newReq);
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO inputjobs (customer_id, lat, lon, startdt, enddt, status, data, date)
      VALUES (${customerId}, ${latCents}, ${lonAbs}, ${startdt}, ${enddt}, ${status}, ${data}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Input Job.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/inputjobs');
  redirect('/dashboard/inputjobs');
}

// ameriflux inputjobs actions
export async function createInputJobAFlx(prevState: ELMState, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInputJob.safeParse({
    customerId: formData.get('customerId'),
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    startdt: formData.get('startdt'),
    enddt: formData.get('enddt'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Input Job.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, lat, lon, startdt, enddt, status } = validatedFields.data;
  const lonAbs = Math.abs(lon) * 100;
  const latCents = lat * 100;
  const date = new Date().toISOString().split('T')[0];

  // Extract JSON file from formData
  const file = formData.get('data') as File;
  const data = await file.text();

  // Insert data into the database
  try {
    const result = await sql`
      INSERT INTO inputjobs (customer_id, lat, lon, startdt, enddt, status, data, date)
      VALUES (${customerId}, ${latCents}, ${lonAbs}, ${startdt}, ${enddt}, ${status}, ${data}, ${date})
      RETURNING id
    `;

    console.log(result);

    const jobId = result.rows[0].id;

    // Call background task but do not wait for it to finish before redirecting
    processInputJobData(jobId, data);
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Input Job.',
    };
  }
 
  revalidatePath('/dashboard/inputjobs');
  redirect('/dashboard/inputjobs');
}


async function processInputJobData(jobId: string, data: string) {
  try {
    // Make external API call to process data
    const response = await axios.post('https://9yt2fg-5000.csb.app/upload', JSON.parse(data), {
      responseType: 'text' // Changed from 'arraybuffer' to 'text'
    });

    if (response.status === 200) {
      const ncFileString = response.data; // Response data is already a string

      // Update the inputjob record with the ncfile string
      await sql`
        UPDATE inputjobs
        SET ncfile = ${ncFileString}
        WHERE id = ${jobId}
      `;
    } else {
      console.error('Failed to download file. Response status:', response.status);
    }
  } catch (error) {
    console.error('Error processing input job data:', error);
  }
}

export async function fetchNCFile(id: string) {
  try {
    const result = await sql`SELECT ncfile FROM inputjobs WHERE id = ${id}`;
    console.log(result.rows[0].ncfile);
    return result.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

