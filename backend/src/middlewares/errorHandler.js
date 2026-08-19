const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'A record with that unique field already exists'
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.message
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server error'
  });
};

module.exports = errorHandler;
