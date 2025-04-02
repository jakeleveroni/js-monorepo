# Authentication

[Documentation](https://jakeleveroni.github.io/js-monorepo/projects/authentication/)

## An Express Based JWT Server

This project started as I was interested in how JWT authentication worked from a backend sense. I had worked on various parts of the authentication flow before but never the actual server that manages generating, assigning, and validating JWTs. It was the perfect opportunity to learn.

## Development

Install any dependencies:

```sh
bun install
```

Start the application

```sh
bun ws -w auth -s dev
```

The server should now be running on `http://localhost:3010`

## Testing

The test suite is setup so that on startup, the database connection the server expects is replaced with an in memory database via [pg-mem](https://github.com/oguimbal/pg-mem). This allows us to test end-to-end from request to database. It also ensures the latest DB schema is applied to the in memory database so you can be confident in your tests. 

API tests are validated with [supertest](https://www.npmjs.com/package/supertest). To run the test suite simple run:

```sh
bun ws -auth -s test
```