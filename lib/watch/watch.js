const loadConfigFile = require('rollup/dist/loadConfigFile');
const path = require('path');
const rollup = require('rollup');

const chokidar = require('chokidar');
const subscribers = [];

function build() {
  console.log('rollup building started');
  // load the config file next to the current script;
  // the provided config object has the same effect as passing "--format es"
  // on the command line and will override the format of all outputs
  loadConfigFile(path.resolve(process.rootDir, 'rollup.config.js'), {}).then(
    async ({ options, warnings }) => {
      // "warnings" wraps the default `onwarn` handler passed by the CLI.
      // This prints all warnings up to this point:
      console.log(`We currently have ${warnings.count} warnings`);

      // This prints all deferred warnings
      warnings.flush();

      // options is an array of "inputOptions" objects with an additional "output"
      // property that contains an array of "outputOptions".
      // The following will generate all outputs for all inputs, and write them to disk the same
      // way the CLI does it:
      for (const optionsObj of options) {
        const bundle = await rollup.rollup(optionsObj);
        await Promise.all(optionsObj.output.map(bundle.write));
      }

      console.log('rollup building finished');

      subscribers.forEach((cb) => cb());
    }
  );
}

const rollupWatchPath = 'front/**/*.{js,svelte}';
const staticWatchPath = 'public/**/*.*!(public/build/**/*.*)';
console.log({ rollupWatchPath });

chokidar
  .watch(rollupWatchPath, { cwd: process.rootDir })
  .on('change', (event, path) => build())
  .on('unlink', (event, path) => build())
  .on('unlinkDir', (event, path) => build());

chokidar
  .watch(staticWatchPath, { cwd: process.rootDir })
  .on('all', (event, path) => subscribers.forEach((cb) => cb()));

function subscribe(cb) {
  if (!subscribers.includes(cb)) {
    subscribers.push(cb);
  }
}

function unsubscribe(cb) {
  const idx = subscribers.indexOf(cb);
  if (idx !== -1) {
    subscribers.splice(idx, 1);
  }
}

exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
