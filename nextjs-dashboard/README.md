## ELM Online Overlay Interface

### Platform Components
This was built from the nextjs-dashboard starter template. For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website. 

Hence, this website is built using Next.js (a feature-rich platform for React apps on the web). It is useful to be familiar with Node.js, React, Next.js and Auth.js when developing this project. The course link mentioned above should give a good introduction to some of these concepts while also familiarizing you with the skeleton that this project was built-on.

For data storage this app requires a PostgreSQL database and blob storage. A simple file system could be used instead of blob storage, but blobs have the advantage of built-in security through un-guessable links.

### Security
Please inspect the folder structure and the files and notice which ones are labeled as server components and client components. Database calls are only made by the server components, so secrets are not exposed to the client.

### Environment variable
Please see the env variable example file in this directory.

### Building and hosting 
This project has only been hosted on Vercel with Vercel Storage (Postgres and Blob). It can be run in a Node.js runtime with a self-hosted databse and blob storage (or a secure filesystem alternative). Please search for "Database Config" to find files in this repository marked with the lines that need to be changed if a different database solution is used. 

Please check-out the /seed route to see how the database should be seeded. When run it will create the necessary tables and seed them with starter data. The defualt user accoun will have the following

### Running in a development environmen
This is a repository of the development environment that was set up by CodeSandbox. This directory specifically used pnpm, not npm. The command to run the dev server in pnpm dev. It should listen and re-render upon changes to the code.

### Tandem operation with a backend Flask Server
The ELM/OLMT Server is a Flask Application that acts as a middleman between ELM and this overlay interface. It accepts requests for processes to be run through API requests and it also interacts with the filesystem storage (in this case blob). However, data from the database is sent from the interface to the ELM/OLMT Server through an API request and results are sent back to this overlay to be stored in the database (the Flask Server does not read/write to the database). Please search "ELM/OLMT Server" for code in this repository that pertains to this interaction with the Flask Server (you will need to change some of this flagged code to connect to your server).

### Vercel Setup

<img width="400" alt="image" src="https://github.com/user-attachments/assets/357eba97-319f-40c5-b2bc-becba6d7d3de">

When deploying this repository on vercel, make sure to set the root directory to this one. Also, you will need to setup Vercel Blob and Vercel Postgres and change the secrets + seed the data to get this operational. Also make sure you are connected to an operational ElM/OLMT Flask Server and see above for how to configure this interface to work with that server.

