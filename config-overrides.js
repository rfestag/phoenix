const rewireStyledComponents = require("react-app-rewire-styled-components");

module.exports = function override(config, env) {
  config = rewireStyledComponents(config, env);
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: [{ loader: "worker-loader" }]
  });
  config.module.rules.push({
    test: /\.shared\.js$/,
    use: { loader: "shared-worker-loader" }
  });
  return config;
};
