const path = require('path');
const preactCliTypeScript = require('preact-cli-plugin-typescript');

/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config original webpack config.
 * @param {object} env options passed to CLI.
 * @param {WebpackConfigHelpers} helpers object with useful helpers when working with config.
 **/
export default function(config, env, helpers) {
  let configWithAlias;
  if (env.production) {
    configWithAlias = preactCliConfigAlias(config, 'config/prod.js');
  } else {
    configWithAlias = preactCliConfigAlias(config, 'config/dev.js');
  }
  return preactCliTypeScript(configWithAlias);
}

const preactCliConfigAlias = (config, configPath) => {
  if (!config) {
    throw Error('You need to pass the webpack config to preactCliConfigAlias');
  }

  // Add the config file to the aliases
  config.resolve.alias['config'] = path.join(__dirname, configPath);

  return config;
};
