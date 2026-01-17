# Code challenge overview

## Generative AI Disclaimer

Generative AI (Claude Code Opus) has been used to aid with

- Unit test generation
- Autocompletion during UI component development
- Seed data generation for database seeding

## Architecture

The structure remained the same with a `backend` and `frontend` folder. A new `shared` folder has been created, which now hosts the contracts between frontend.

The project now utilises `ts-rest` to enable fully typesafe communication between frontend and backend. All data is validated using `zod`.
`ts-rest` is also being used to register routes and data handlers.

All the expected technology has been used, even though I am unfamiliar with some of the chosen technologies. I hope to highlight my willingness and ability to work with unknown technologies and frameworks with this choice.

## Divergences to the acceptance criteria

The UI structure has been altered slightly, such that a dashboard is loaded on the landing page where the user can select an organisation, sees the employees of that organisation and can open their deals and earnings reports from there. This choice has been made in favor of better usability. This does not impact the scope of the functionality.

## Review instructions



## Challenges

### Time

The biggest challenge by far were time constraints.

Even though I kept typing all the time (doing all the VIM magic I am capable of) and used generative AI to speed up UI component and unit test development, just checking documentation from time to time and taking only one restroom break, I was unable to complete the assigned task in under 6 hours.

Given the amount of code I have produced, I do not believe it is possible to complete the assignment in the expected time and create an acceptable result.

### UUID issues

Utilizing both ZOD and Prisma, I quickly realized that the automatically generated UUIDs by Prisma did not pass the ZOD schema validation.

This issue cost some time to debug and find a solution for, even though the solution turned out to be quite simple - I just generated the IDs myself.

### Prisma issues

Following the Prisma documentation for the initial setup, I encountered an issue where the database was unreachable.

It turned out that the dotenv import was missing, which is a super easy fix, but being unfamiliar with Prisma this issue cost me some time.

### Ambiguous acceptance criteria

Even though the acceptance criteria was clear in hindsight, during implementation I had to iterate on multiple criteria, because they were not clear to me during the first read through.
