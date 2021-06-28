

function modJsCssController(req, res, i, mod_js, mod_css, back){
  if(back){
    log('info', '-> set backModules');
    for(let name_mod of data.path[i].backModules){
      mod_js = mod_js + fs.readFileSync(
        (data.clientPath+'modules/back/'+name_mod+'/main.js')
      );
      mod_css = mod_css + fs.readFileSync(
        (data.clientPath+'modules/back/'+name_mod+'/style.css')
      );
    }
  }
  for(let name_mod of data.path[i].mainModules){
    mod_js = mod_js + fs.readFileSync(
      (data.clientPath+'modules/main/'+name_mod+'/main.js')
    );
    mod_css = mod_css + fs.readFileSync(
      (data.clientPath+'modules/main/'+name_mod+'/style.css')
    );
  }
  return {js: mod_js, css: mod_css};
}
