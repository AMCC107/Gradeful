const path = require('path');
const newman = require('newman');
const { generateFixtures } = require('./generate-fixtures');

process.env.DB_PATH = path.join(__dirname, '..', 'data', `postman-${process.pid}.db`);
process.env.JWT_SECRET = 'postman-test-secret';

async function run() {
  await generateFixtures();
  const { initDatabase } = require('../config/database');
  const { app } = require('../index');
  await initDatabase();
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const port = server.address().port;

  await new Promise((resolve, reject) => {
    newman.run(
      {
        collection: require('./Gradeful.postman_collection.json'),
        envVar: [{ key: 'baseUrl', value: `http://127.0.0.1:${port}` }],
        workingDir: __dirname,
        reporters: ['cli'],
      },
      (error, summary) => {
        server.close();
        if (error) return reject(error);
        if (summary.run.failures.length) {
          return reject(new Error(`${summary.run.failures.length} prueba(s) Postman fallaron.`));
        }
        return resolve();
      }
    );
  });
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
