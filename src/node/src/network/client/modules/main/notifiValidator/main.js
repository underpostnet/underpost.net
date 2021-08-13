
const notifiValidator = {
    loader: async () =>{
      notifiValidator.init.renderCss();
      notifiValidator.init.renderHtml();
      notifiValidator.init.onEvent();
    },
    init: {
      renderHtml: async ()=>{
            append('body', `
                <notifiValidator class='fix' style='display: none;'>
                      <div class='abs notifiValidator-c1'>
                      </div>
                      <div class='abs notifiValidator-c2'>
                      </div>
                </notifiValidator>
            `);
      },
      renderCss: async ()=>{},
      onEvent: async ()=>{}
    },
    service: {
      display: (state, msg, time)=>{
        if(!state){
          s('notifiValidator').style.background = 'red';
          htmls('.notifiValidator-c1', `
                  <div class='abs center'>
                        <i class='fa fa-times'></i>
                  </div>
          `);
          htmls('.notifiValidator-c2', `
                  <div class='abs center' style='width: 95%;'>
                        `+msg+`
                  </div>
          `);
          fadeIn(s('notifiValidator'));
          setTimeout(()=>{
            fadeOut(s('notifiValidator'));
          }, time);
        }else{
          s('notifiValidator').style.background = 'green';
          htmls('.notifiValidator-c1', `
                  <div class='abs center'>
                        <i class='fa fa-check'></i>
                  </div>
          `);
          htmls('.notifiValidator-c2', `
                  <div class='abs center' style='width: 95%;'>
                        `+msg+`
                  </div>
          `);
          fadeIn(s('notifiValidator'));
          setTimeout(()=>{
            fadeOut(s('notifiValidator'));
          }, time);
        }
      }
    },
    render: async () =>{}
  }
