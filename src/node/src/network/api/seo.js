app.get('/favicon.ico', (req, res) => {
  res.sendFile(data.staticPath+'img/favicon.ico');
});
