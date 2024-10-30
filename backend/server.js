import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js';

const server = express();
const PORT = process.env.PORT || 3000;

// Middleware
server.use(bodyParser.json());

// Routes
server.use('/api', routes);

// Error handling middleware
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Export the server for testing
export default server;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
