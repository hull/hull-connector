const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err) {
    const data = {
      status: err.status,
      segmentBody: req.segment,
      method: req.method,
      headers: req.headers,
      url: req.url,
      params: req.params
    };
    return res.status(err.status || 500).send({ message: err.message });
  }
  return res.status(err.status || 500).send({ message: 'undefined error' });
};

export default errorHandler;
