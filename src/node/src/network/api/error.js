
setTimeout(()=>{
  console.log(" init status error middleware -> ");
  app.use( (req, res, next) => {
    for(let num_error of range(400, 499)){
      res.status(num_error).redirect(301, '/error/'+num_error);
    }
  });

  app.use( (req, res, next) => {
     for(let num_error of range(500, 599)){
       res.status(num_error).redirect(301, '/error/'+num_error);
     }
  });
}, data.delayInitStatusError);
