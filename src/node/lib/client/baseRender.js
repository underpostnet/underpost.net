var mod_underpost = '';
for(var ii=0;ii<l(data.path[i].underpost);ii++){
  mod_underpost = mod_underpost
  + fs.readFileSync((data.underpostClientPath+data.path[i].underpost[ii]));
}
//-----------------------------------------------------
//-----------------------------------------------------
var renderMicrodata = '';
for(var jsonMicrodata of microdata){
  renderMicrodata = renderMicrodata + `
  <script type="application/ld+json">
  `+JSONstr(jsonMicrodata)+`
  </script>
  `;
}
//-----------------------------------------------------
//-----------------------------------------------------
var h1 = '';
for(var ii=0;ii<l(data.path[i].h1);ii++){
  h1 = h1 + `
    <h1>
    `+data.path[i].h1[ii][lang_id]+`
    </h1>
  `;
}
//-----------------------------------------------------
//-----------------------------------------------------
var h2 = '';
for(var ii=0;ii<l(data.path[i].h2);ii++){
    h2 = h2 + `
    <h2>
    `+data.path[i].h2[ii][lang_id]+`
    </h2>
  `;
}
//-----------------------------------------------------
//-----------------------------------------------------
var fonts = '<style>';
for(var ii=0;ii<l(data.fonts);ii++){
  fonts = fonts + 	`
  @font-face {
    font-family: '`+data.fonts[ii].name+`';
    src: URL('`+data.fonts[ii].url+`') format('`+data.fonts[ii].type+`');
  }
  `;
}
fonts = fonts + '</style>';
//-----------------------------------------------------
//-----------------------------------------------------
var mod_lib = '';
for(var ii=0;ii<l(data.path[i].lib);ii++){
  mod_lib = mod_lib
  + fs.readFileSync((data.underpostClientPath+'lib/'+data.path[i].lib[ii]));
}
//-----------------------------------------------------
//-----------------------------------------------------
