for(let i=0; i<l(data.path);i++){
	const suburl = data.path[i].url;
  app.get(suburl, function(req, res) {
		
		let infoHead = logHeader(req, res, data, i, true);
		let lang = infoHead.lang;
		let lang_id = infoHead.id;
		for(let mod of UnderpostMods.client){
		  console.log('Load client module -> '+mod);
		  eval(loadUnderpostMod(mod, 'client'));
		}

		/*

		mod_js
		mod_css
		mod_underpost
		mod_lib
		h1
		h2
		fonts
		renderMicrodata

		*/


		var mainJs = fs.readFileSync(data.clientPath+'path/'+data.path[i].main_path+'/main.js').toString();


		mainJs = mainJs.replace('{{UNDERPOST}}', (mod_lib+mod_underpost));
		mainJs = mainJs.replace('{{COMPONENTS}}', mod_js);
		mainJs = mainJs.replace('{{INITDATA}}',`
					data.const.token = '`+req.session.token+`';
					data.const.lang = `+lang_id+`;
		`);

		res.write((`

			<!DOCTYPE html>

			<html dir='`+data.dir+`' lang='`+lang+`'>

			<head>

			<meta charset='`+data.path[i].charset+`'>

			<title>`+data.path[i].title[lang_id]+`</title>

			`+renderMicrodata+`

			<meta name ='title' content='`+data.path[i].title[lang_id]+`' />
			<meta name ='description' content='`+data.path[i].description[lang_id]+`' />
			<meta name ='theme-color' content = '`+data.color+`' />

			<link rel='canonical' href='`+data.url+data.path[i].url+`' />

			<link rel='icon' type='`+data.favicon.type+`' href='`+data.favicon.url+`' />

			<meta property='og:title' content='`+data.path[i].title[lang_id]+`' />
			<meta property='og:description' content='`+data.path[i].description[lang_id]+`' />
			<meta property='og:image' content='`+data.url+data.path[i].image+`' />
			<meta property='og:url' content='`+data.url+data.path[i].url+`' />
			<meta name='twitter:card' content='summary_large_image' />

			<meta name='viewport' content='initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>

			<meta name='viewport' content='width=device-width, user-scalable=no' />

			<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>

			`+fonts+`

			<style>

				`+fs.readFileSync(

					data.underpostClientPath+'style/'+data.path[i].main_css

				)+`

			</style>

			`+mod_css+`

			</head>

			<body>

			`+h1+h2+`

			<script type='text/javascript' async defer>`+mainJs+`</script>

			</body>

			</html>

			`));

			res.end();


  });
};
