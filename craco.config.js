module.exports = {
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      if (devServerConfig.onBeforeSetupMiddleware) {
        devServerConfig.onBeforeSetupMiddleware(devServer);
      }

      if (devServerConfig.onAfterSetupMiddleware) {
        devServerConfig.onAfterSetupMiddleware(devServer);
      }

      return middlewares;
    };

    delete devServerConfig.onBeforeSetupMiddleware;
    delete devServerConfig.onAfterSetupMiddleware;

    return devServerConfig;
  },
};

// Refined for hackathon submission
