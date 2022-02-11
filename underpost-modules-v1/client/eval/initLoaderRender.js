


var main_loader_js = "";
var main_render_js = "";

for(let module_ of data.path[i].mainModules){

  let fix = module_.split('/').reverse()[0];
  main_loader_js += 'await '+fix+'.loader(); ';
  main_render_js += 'await '+fix+'.render(); ';

}


/*

notifiValidator.loader();
contentPlayGrid.loader();
cards.loader();
// oldGallery.loader();
notifiValidator.render();
contentPlayGrid.render();
cards.render();
// oldGallery.render();


*/
