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
      {{LOADER}}
    },
    render: async ()=>{
      {{RENDER}}
    }
  };

  //----------------------------------------------------------------------------
  // DATA
  //----------------------------------------------------------------------------

  let data = {
    const: {
      callback: 300,
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
  // MAIN
  //----------------------------------------------------------------------------

  const main = {
    init: async ()=> {
      s('html').lang = ['en','es'][data.const.lang];
      s('html').dir = data.const.dir;
      console.log('init template system lang -> '+['en','es'][data.const.lang]);
      notifi.load({
        AttrImg: {
          failed: "failed",
          check: "success"
        },
        style: {
          notifiValidator: `
          bottom: 20px;
          border-radius: 10px;
          border: 2px solid yellow;
          z-index: 9999;
          height: 50px;
          transform: translate(-50%, 0);
          left: 50%;
          width: 300px;
          `,
          notifiValidator_c1: `
          width: 80px;
          height: 100%;
          border: 2px solid blue;
          top: 0%;
          left: 0%;
          `,
          notifiValidator_c2: `
          height: 100%;
          border: 2px solid blue;
          top: 0%;
          left: 80px;
          width: 220px;
          `

        }
      });
      await global.init();
      await main.render();
      s('html').scrollTop = 0;
    },
    render: async ()=>{
      if(data.var.w!=window.innerWidth || data.var.h!=window.innerHeight){
        data.var.w=window.innerWidth;
        data.var.h=window.innerHeight;
        console.log('-> render | w:'+data.var.w+' h:'+data.var.h);
        await global.render();
      }
      console.log('callback');
      await timer(data.const.callback);
      await main.render();
    }
  };

  main.init();

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
})());
