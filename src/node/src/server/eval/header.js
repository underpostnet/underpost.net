


function logHeader(req, res, data, i, html_head){

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	log('info',
		`
		http connection
		url: `+data.path[i].url+`
		ip: `+ip+`
		time: `+new Date().toISOString()+`
		host: `+req.headers.host+`
		lang: `+req.acceptsLanguages()+`
		token: `+req.session.token+`
		`
	);

  var lang = (''+req.acceptsLanguages()).split('-')[0].split(',')[0];
  var id = lang=='es'? 1 : 0;

  if(html_head){
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Language': lang
    });
  }
	// res.setHeader('Content-Type', 'application/json');

	return {lang: lang, id: id};

}

function logHeaderApi(req, res, path, html_head){

	generateToken(req);

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	log('info',
		`
		http connection
		url: `+path+`
		ip: `+ip+`
		time: `+new Date().toISOString()+`
		host: `+req.headers.host+`
		lang: `+req.acceptsLanguages()+`
		token: `+req.session.token+`
		`
	);

  var lang = (''+req.acceptsLanguages()).split('-')[0].split(',')[0];
  var id = lang=='es'? 1 : 0;

  if(html_head){
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Language': lang
    });
  }
	// res.setHeader('Content-Type', 'application/json');

	return {lang: lang, id: id};

}
