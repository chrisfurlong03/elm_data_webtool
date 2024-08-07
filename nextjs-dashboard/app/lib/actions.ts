'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn, createUser, checkUser } from '@/auth';
import { AuthError } from 'next-auth';
import axios from 'axios';
import { Readable } from 'stream';
import * as readline from 'readline';
import { fetchInputJobById } from './data';

// New schema

const ELMFormSchema = z.object({
  id: z.string(),
  lat: z.coerce
    .number()
    .min(14.5, { message: 'Latitude must be greater than or equal to 14.5' })
    .max(52.0, { message: 'Latitude must be less than or equal to 52.0' }),
  lon: z.coerce
    .number()
    .min(-131.0, {
      message: 'Longitude must be greater than or equal to -131.0',
    })
    .max(-53.0, { message: 'Longitude must be less than or equal to -53.0' }),
  startdt: z.coerce.number().gt(0, { message: 'Please enter a year.' }),
  enddt: z.coerce.number().gt(0, { message: 'Please enter a year.' }),
  data: z.string(),
  status: z.enum(['pending', 'ready'], {
    invalid_type_error: 'Please select a status.',
  }),
  date: z.string(),
});

const CreateInputJob = ELMFormSchema.omit({ id: true, date: true, data: true, status: true});
const UpdateInputJob = ELMFormSchema.omit({ id: true, date: true });

export type ELMState = {
  errors?: {
    lat?: string[];
    lon?: string[];
    startdt?: string[];
    enddt?: string[];
    data?: string[];
    status?: string[];
  };
  message?: string | null;
};

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
      message: 'Missing Fields. Failed to Update Input Job.',
    };
  }

  const { lat, lon, startdt, enddt, status } = validatedFields.data;

  try {
    await sql`
      UPDATE inputjob
      SET lat = ${lat}, lon = ${lon}, startdt = ${startdt}, enddt = ${enddt}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Input Job.' };
  }

  revalidatePath('/dashboard/inputjobs');
  redirect('/dashboard/inputjobs');
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

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const search = await checkUser(email);
    if (!search) {
      await createUser(email, name, password);
      return authenticate(prevState, formData);
    } else {
      return 'User already exists';
    }
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

type inputparms = {
  lat: number;
  lon: number;
  startYear: number;
  endYear: number;
};

export async function takeORNLInputs(req: inputparms): Promise<any> {
  const { lat, lon, startYear, endYear } = req;

  const daymetUrl = `https://daymet.ornl.gov/single-pixel/api/data?lat=${lat}&lon=${lon}&vars=tmax,tmin,srad,vp,prcp,dayl&start=${startYear}-01-01&end=${endYear}-12-31`;

  try {
    const response = await axios.get(daymetUrl, {
      responseType: 'stream',
    });

    const jsonData = await csvToJson(response.data);

    // Process data
    console.log(jsonData);
    const processedData = await processData(jsonData);
    return processedData;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return new Promise((resolve, reject) => {
        let errorMessage = '';
        error.response.data.on('data', (chunk: Buffer) => {
          errorMessage += chunk.toString();
        });

        error.response.data.on('end', () => {
          resolve(errorMessage + '... No Daymet data for this location!');
        });

        error.response.data.on('error', (err: Error) => {
          resolve(err.message);
        });
      });
    } else {
      return error.message;
    }
  }
}

export async function takeInputs(jobId: string, req: any) {

  const { lat, lon, startYear, endYear } = req;

  const nasaUrl = `https://power.larc.nasa.gov/api/temporal/hourly/point?start=${startYear}0101&end=${endYear}1231&latitude=${lat}&longitude=${lon}&community=re&parameters=T2M%2CRH2M%2CWS2M%2CPS%2CCLRSKY_SFC_PAR_TOT%2CPRECTOTCORR&format=json&header=true&time-standard=lst`;

  try {
    const response = await axios.get(nasaUrl);
    const data = response.data.properties.parameter;

    // Process data
    const processedData = await processData(data);
    await sql`
    UPDATE inputjobs
    SET data = ${processedData}
    WHERE id = ${jobId};
    `
    processInputJobData(jobId, false)
  } catch (error) {
    console.error('Error fetching data from NASA Power API:', error);
    }

}

async function csvToJson(
  stream: Readable,
): Promise<Record<string, Record<string, number>>> {
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const lines: string[] = [];
  for await (const line of rl) {
    lines.push(line);
  }

  const headers = lines[6].split(',');
  const dataLines = lines.slice(7);

  const result: Record<string, Record<string, number>> = {};

  headers.slice(2).forEach((header) => {
    result[header] = {};
  });

  dataLines.forEach((line) => {
    const values = line.split(',');
    const year = values[0];
    const yday = values[1];
    const key = `${year}_${yday}`;

    headers.slice(2).forEach((header, index) => {
      result[header][key] = parseFloat(values[index + 2]);
    });
  });

  return result;
}

type ProcessedData = {
  [key: string]: number[];
};

export async function processData(
  data: Record<string, any>,
): Promise<string> {
  const outvars = ['TA', 'RH', 'WS', 'PA', 'PPFD_OUT', 'P'];
  const invars = ['T2M', 'RH2M', 'WS2M', 'PS', 'CLRSKY_SFC_PAR_TOT', 'PRECTOTCORR'];

  const processedData: ProcessedData = {};

  for (let i = 0; i < outvars.length; i++) {
    const outvar = outvars[i];
    const invar = invars[i];

    if (data[invar]) {
      processedData[outvar] = Object.values(data[invar]).map(
        (value: any) => Number(value),
      );
    } else {
      console.warn(`Data for ${invar} is missing`);
      processedData[outvar] = [];
    }
  }

  return JSON.stringify(processedData);
}

// inputjobs database actions

export async function createInputJob(prevState: ELMState, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInputJob.safeParse({
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    startdt: formData.get('startdt'),
    enddt: formData.get('enddt'),
    status: formData.get('status'),
  });
  let session = await auth();
  let user = await checkUser(session?.user?.email as string);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Input Job.',
    };
  }

  // Prepare data for insertion into the database
  const { lat, lon, startdt, enddt } = validatedFields.data;
  const lonAbs = Math.abs(lon) * 100;
  const latCents = lat * 100;
  const date = new Date().toISOString().split('T')[0];
  const newReq = {
    lat: lat,
    lon: lon,
    startYear: startdt,
    endYear: enddt,
  };
  var result;
  var jobId: string;
  // Insert data into the database
  try {
    result = await sql`
      INSERT INTO inputjobs (customer_id, lat, lon, startdt, enddt, status, data, date, time_step_day)
      VALUES (${user.id}, ${latCents}, ${lonAbs}, ${startdt}, ${enddt}, 'pending', 'pending', ${date}, 24)
      RETURNING id
    `;
    jobId = result.rows[0].id;

  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Input Job.',
    };
  }
  takeInputs(jobId, newReq);
  revalidatePath(`/dashboard/inputjobs/`);
  redirect(`/dashboard/inputjobs/${jobId}/edit`);
}

// ameriflux inputjobs actions
export async function createInputJobAFlx(
  prevState: ELMState,
  formData: FormData,
) {
  // Validate form using Zod
  const validatedFields = CreateInputJob.safeParse({
    lat: formData.get('lat'),
    lon: formData.get('lon'),
    startdt: formData.get('startdt'),
    enddt: formData.get('enddt'),
  });
  let session = await auth();
  let user = await checkUser(session?.user?.email as string);
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Input Job.',
    };
  }

  // Prepare data for insertion into the database
  const { lat, lon, startdt, enddt } = validatedFields.data;
  const lonAbs = Math.abs(lon) * 100;
  const latCents = lat * 100;
  const date = new Date().toISOString().split('T')[0];

  // Extract JSON file from formData
  const file = formData.get('data') as File;
  const data = await file.text();
  var jobId = ""
  // Insert data into the database
  try {
    const result = await sql`
      INSERT INTO inputjobs (customer_id, lat, lon, startdt, enddt, status, data, date, time_step_day)
      VALUES (${user.id}, ${latCents}, ${lonAbs}, ${startdt}, ${enddt}, 'pending', ${data}, ${date}, 48)
      RETURNING id
    `;


    jobId = result.rows[0].id;

    // Call background task but do not wait for it to finish before redirecting
    processInputJobData(jobId);
  } catch (error) {
    // If a database error occurs, return a more specific error.
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Input Job.',
    };
  }
  revalidatePath(`/dashboard/inputjobs/`);
  redirect(`/dashboard/inputjobs/${jobId}/edit`);
}

async function processInputJobData(jobId: string, aflux: boolean = false) {
  try {
    const data = await fetchInputJobById(jobId);
    var response;
    // Make external API call to process data
    if (aflux) {
       response = await axios.post(
        'https://seahorse-app-xu2hp.ondigitalocean.app/upload?aflux',
        JSON.parse(data.data),
        {
          responseType: 'text', // Changed from 'arraybuffer' to 'text'
        },
      );
    } else {
      response = await axios.post(
        'https://seahorse-app-xu2hp.ondigitalocean.app/upload',
        JSON.parse(data.data),
        {
          responseType: 'text', // Changed from 'arraybuffer' to 'text'
        },
      );
    }


    if (response.status === 200) {
      const ncFileString = response.data; // Response data is already a string

      // Update the inputjob record with the ncfile string
      await sql`
        UPDATE inputjobs
        SET ncfile = ${ncFileString}, status = 'ready'
        WHERE id = ${jobId}
      `;
    } else {
      console.error(
        'Failed to download file. Response status:',
        response.status,
      );
    }
  } catch (error) {
    console.error('Error processing input job data:', error);
  }
}

export async function fetchNCFile(id: string) {
  try {
    const result = await sql`SELECT ncfile FROM inputjobs WHERE id = ${id}`;
    console.log(result.rows[0].ncfile);
    
    return JSON.parse(result.rows[0].ncfile);
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function pendingStatus(id:string) {
  try {
    const result = await sql`SELECT status FROM inputjobs WHERE id = ${id}`;
    console.log(result.rows[0].status);
    
    return result.rows[0].status;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

