const responder = async (
    res,
    success = true,
    message = "",
    data = null,
    statusCode = 200
  ) => {
    return res.status(statusCode).json({
      success,
      message,
      data,
    });
  };
  
  export { responder };