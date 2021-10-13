const Hapi = require('@hapi/hapi');

let BaseRoutes = require('./base-routes')
this.baseRoutes = new BaseRoutes();
const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    routes: {
      cors: true
    }
  });

  server.route(this.baseRoutes.PublicRoutes());
  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
