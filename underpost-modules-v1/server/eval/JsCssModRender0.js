

function modJsCssController(req, res, i, mod_js, mod_css, back){

  for(let mod of data.path[i].modules){

    if(mod.type=='global'){
      mod_js = mod_js + fs.readFileSync(
        (data.clientPath+'modules/global/'+mod.name+'/main.js')
      );
      mod_css = mod_css + fs.readFileSync(
        (data.clientPath+'modules/global/'+mod.name+'/style.css')
      );
    }

    if(mod.type=='back'&&(back)){
      mod_js = mod_js + fs.readFileSync(
        (data.clientPath+'modules/back/'+mod.name+'/main.js')
      );
      mod_css = mod_css + fs.readFileSync(
        (data.clientPath+'modules/back/'+mod.name+'/style.css')
      );
    }

    if(mod.type=='main'&&(!back)){
      mod_js = mod_js + fs.readFileSync(
        (data.clientPath+'modules/main/'+mod.name+'/main.js')
      );
      mod_css = mod_css + fs.readFileSync(
        (data.clientPath+'modules/main/'+mod.name+'/style.css')
      );
    }

  }

  return {js: mod_js, css: mod_css};
}
