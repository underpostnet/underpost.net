var main_loader_js = "";
var main_render_js = "";

for(let mod of data.path[i].modules){

  let fix = mod.name.split('/').reverse()[0];

  if(mod.type=='global'){
    main_loader_js += 'await '+fix+'.loader(); ';
    main_render_js += 'await '+fix+'.render(); ';
  }

  if(mod.type=='back'&&(back_)){
    main_loader_js += 'await '+fix+'.loader(); ';
    main_render_js += 'await '+fix+'.render(); ';
  }

  if(mod.type=='main'&&(!back_)){
    main_loader_js += 'await '+fix+'.loader(); ';
    main_render_js += 'await '+fix+'.render(); ';
  }

}
