define('memoryUsage', (_, { respond }) => {
  respond(process.memoryUsage.rss());
});
