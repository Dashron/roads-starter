# This is an old example project for the roads framework. There is a new version in development that will replace this. I do not recommend you use this.

# roads-starter

- [Getting Started](#getting-started)

## Getting Started

### Trying the example
1. Pop open the `config` folder and make duplicates of every file in there. Remove the word "example" from the copies.
2. In each of those new non-example files, fill in the appropriate values.
3. From the example folder run `./docker-compose.sh up` to test the example

### Building a new project
1. Copy the contents of the example folder to a new project
2. Create a package.json file with a dependency on roads-starter (remember to make it private if you need to!)
3. Update all `../index.js` references (such as the one in server.js) to reference roads-starter
4. Pop open the `config` folder and make duplicates of every file in there. Remove the word "example" from the copies.
5. In each of those new non-example files, fill in the appropriate values.
6. Run `./docker-compose.sh up` to test the copied example
7. Add new API routes in the API folder and reference them via server.js.
8. Add new web routes in the privateRoutes.js (for routes that access private data or endpoints) or publicRoutes.js (for routes that can safely be sent to the client and executed in the browser)
