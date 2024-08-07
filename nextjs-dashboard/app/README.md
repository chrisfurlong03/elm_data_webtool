## This is the Next.js App Router directory
You need to be familiar wit the App Router basics. Again, the nextjs tutorial is a good place to start for understanding the functionality of the content in this directory.

The seed folder should be deleted upon deployment. 

## Notes on structure and organisation
Most actions should be in the lib/action.ts or lib/data.ts files. These are server components which run on the server, away from the client. They protect sensitive operations from being executed or exposed by client. 

## Note on styling
This project uses tailwind which essentially provides in-line styling. As such, re-used style should be turned into reusable components where possible. As an example, see ui/inputjobs/buttons.ts. 
