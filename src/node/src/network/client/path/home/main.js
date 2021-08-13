((()=>{

  //----------------------------------------------------------------------------
  // UNDERpost.net LIBRARY
  //----------------------------------------------------------------------------

  {{UNDERPOST}}

  //----------------------------------------------------------------------------
  // COMPONENTS
  //----------------------------------------------------------------------------

  {{COMPONENTS}}

  //----------------------------------------------------------------------------
  // GLOBAL
  //----------------------------------------------------------------------------

  const global = {
    init: async ()=>{
      notifiValidator.loader();
      contentPlayGrid.loader();
      cards.loader();
      // oldGallery.loader();
    },
    render: async ()=>{
      notifiValidator.render();
      contentPlayGrid.render();
      cards.render();
      // oldGallery.render();
    }
  };

  //----------------------------------------------------------------------------
  // DATA
  //----------------------------------------------------------------------------

  let data = {
    const: {
      callback: 100,
      lang: lang()=='en' ? 0 : 1,
      dir: 'ltr',
      token: null
    },
    var: {
      w: null,
      h: null
    }
  };

  {{INITDATA}}

  //----------------------------------------------------------------------------
  // MAIN HTML ( HEAD & BODY )
  //----------------------------------------------------------------------------

  const main = {
    init: async ()=> {
      s('html').lang = ['en','es'][data.const.lang];
      s('html').dir = data.const.dir;
      console.log('init template system lang -> '+['en','es'][data.const.lang]);
      append('body',`
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
            .fas, .fa {
              font-size: 18px;
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
        </style>
      `);
      // `+spr('test <br>', 1000)+`
      notclick('body', 1, false);
	    notclick('body', 2, false);
      global.init();
      main.render();
    },
    render: async ()=>{
      if(data.var.w!=window.innerWidth || data.var.h!=window.innerHeight){
        data.var.w=window.innerWidth;
        data.var.h=window.innerHeight;
        s('body').style.width = data.var.w+'px';
        s('body').style.height = data.var.h+'px';
        console.log('-> render | w:'+data.var.w+' h:'+data.var.h);
        global.render();
      }
      console.log('callback');
      await timer(data.const.callback);
      main.render();
    }
  };

  main.init();

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
})());
