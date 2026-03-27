function formatResponse({ ok = true, data = null, error = null }) {
  return {
    success: ok,
    data,
    error,
  };
}

function handleError(res, error, status = 500) {
  console.error(error);
  return res.status(status).json(formatResponse({ ok: false, error: error.message || error }));
}

module.exports = { formatResponse, handleError };
