
setTimeout(()=>{
  console.log(" init status error middleware -> ");
  app.use( (req, res, next) => {
     // res.status(404).send('Sorry cant find that!');
     res.status(404).redirect(301, '/error/404');
  });


  app.use( (req, res, next) => {
    // res.status(500).send('Sorry server error!');
    res.status(500).redirect(301, '/error/500');
  });
}, data.delayInitStatusError);
