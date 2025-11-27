/**
 * Root route handler for Vercel
 * Returns a simple message indicating the API is running
 */
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Vapi Knowledge Base API',
    endpoint: '/api/kb/search',
    status: 'running'
  });
};

