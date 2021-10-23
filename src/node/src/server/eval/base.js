// var express = require('express');
// var app = express();
// var var_dump = require('var_dump');
// var path = require('path');


var static = {
	get: function(dir){
		if(dir==null){
			return path.join(data.staticPath, '');
		}
		return path.join(data.staticPath, dir);
	}
};

function setStatic(list){
	for(let i=0; i<list.length; i++){
		const staticDir = '/'+list[i];
		app.use(express.static(staticDir));
		app.use(staticDir, express.static(static.get() + staticDir));
		console.log('set static dir -> '+(static.get() + staticDir));
	}
}
setStatic(data.static);

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function generateToken(req){
	if(!req.session.token){
		let token = getHash();
	  req.session.token = token;
		if(req.headers.host===data.url.split('//')[1]){
	    usersToken.push(token);
			log('info', 'generate valid token -> host:'+req.headers.host+' token:'+req.session.token);
	  }else{
			log('error', 'generate corrupt token -> host:'+req.headers.host+' token:'+req.session.token);
		}
	}
}

function validateToken(token){
  for(let check of usersToken){
    if(check===token){
      return true;
    }
  }
  return false;
}

function validateLogToken(token){
	if(logUsersToken!=undefined){
		for(let check of logUsersToken){
			if(check===token){
	      return true;
	    }
		}
	}
	return false;
}

app.get('/robots.txt', function(req, res) {
	res.sendFile(data.dataPath+'robots.txt');
});

app.get('/sitemap.xsl', function(req, res) {
	res.sendFile(data.underpostClientPath+'xml/sitemap.xsl');
});

var sitemap = '';
for(var renderSitemap of data.path){
	sitemap = sitemap+`
	<url>
        <loc>`+data.url+renderSitemap.url+`</loc>
        <lastmod>`+renderSitemap.date+`</lastmod>
				<changefreq>`+renderSitemap.changefreq+`</changefreq>
				<priority>`+renderSitemap.priority+`</priority>
	</url>
	`;
}

var baseSitemap = fs.readFileSync(
	data.underpostClientPath+'xml/sitemap.xml').toString().split('</urlset>');
sitemap = baseSitemap[0].replace('{sitemap-xsl-url}',(data.url+'/sitemap.xsl'))+sitemap+'</urlset>';
app.get('/sitemap.xml', function(req, res) {
	res.type('application/xml');
	res.write(sitemap);
	res.end();
});
