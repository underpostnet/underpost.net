
function gentPath(suburl, req, res, i, back_, initData){
	let infoHead = logHeader(req, res, data, i, true, back_);
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
	main_loader_js
	main_loader_js

	*/


	var mainJs =
	fs.readFileSync(
		data.clientPath+'cores/'+data.path[i].client_core
	).toString();

	mainJs = mainJs.replace('{{UNDERPOST}}', (mod_lib+mod_underpost));
	mainJs = mainJs.replace('{{COMPONENTS}}', mod_js);
	mainJs = mainJs.replace('{{INITDATA}}', initData+`
				data.const.token = '`+req.session.token+`';
				data.const.lang = `+lang_id+`;
	`);

	mainJs = mainJs.replace('{{LOADER}}', main_loader_js);
	mainJs = mainJs.replace('{{RENDER}}', main_render_js);

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

		<link rel='canonical' href='`+data.url+suburl+`' />

		<link rel='icon' type='`+data.favicon.type+`' href='`+data.favicon.url+`' />

		<meta property='og:title' content='`+data.path[i].title[lang_id]+`' />
		<meta property='og:description' content='`+data.path[i].description[lang_id]+`' />
		<meta property='og:image' content='`+data.url+data.path[i].image+`' />
		<meta property='og:url' content='`+data.url+suburl+`' />
		<meta name='twitter:card' content='summary_large_image' />

		<meta name='viewport' content='initial-scale=1.0, maximum-scale=1.0, user-scalable=0'/>

		<meta name='viewport' content='width=device-width, user-scalable=no' />

		<!-- <script async src='https://www.googletagmanager.com/gtag/js?id=`+data.googletag+`'></script>

		<script type='text/javascript'>

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());
		gtag('config', '`+data.googletag+`');

		</script> -->

		`+fonts+`

		<style>

					h1, h2 {
						display: none;
					}
					body {
						cursor: default;
						font-family: 'retro-font';
						font-size: 10px;
						overflow-x: hidden;
					}
					/* width */
					::-webkit-scrollbar {
						width: 10px;
					}

					/* Track */
					::-webkit-scrollbar-track {
						background: #f1f1f1;
					}

					/* Handle */
					::-webkit-scrollbar-thumb {
						background: #888;
					}

					/* Handle on hover */
					::-webkit-scrollbar-thumb:hover {
						background: #555;
					}

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

}

for(let i=0; i<l(data.path);i++){



	const suburl = data.path[i].url;
  app.get(suburl, function(req, res) {
			gentPath(suburl, req, res, i, false, '');
			res.end();
  });

	const backurl = data.path[i].back_url;
	app.get(backurl, function(req, res) {
			gentPath(backurl, req, res, i, true, '');
			res.end();
  });

};
