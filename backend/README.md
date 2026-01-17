# Setup

## Installation

To install the dependencies, run

```shell
yarn install
```

To create the environment, run

```shell
cp .env.example .env
```

## Migration

To migrate the database, run

```shell
yarn db:migrations:apply
```

To create a new migration, run

```shell
yarn db:migrations:generate name-of-the-migration
```

## Seeding

To seed the database, run

```shell
yarn db:seed
```