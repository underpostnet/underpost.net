const cards = {
  loader: async () =>{
    cards.init.renderCss();
    cards.init.renderHtml();
    cards.init.onEvent();
  },
  init: {
    renderHtml: async ()=>{


      //------------------------------------------------------------------------
      //------------------------------------------------------------------------

      let ind = 0;
      for(let card of cards.service.getAllcard()){
        let cardClass = '.cell-'+card.cell_x+'-'+card.cell_y;
        append(cardClass, `



            <div class='abs card-content-template card-`+ind+`'>


                  <div class='abs card-content-body'>


                      <div class='abs center'>

                          `+cards.service.renderCardBody(ind, card)+`

                      </div>


                  </div>
                  <div class='abs card-content-life'>

                      <div class='abs center card-stat-life-`+ind+`'>`+card.life+`</div>

                  </div>
                  <div class='abs card-content-attack'>

                      <div class='abs center card-stat-attack-`+ind+`'>`+card.attack+`</div>

                  </div>


            </div>


        `);
        ind++;
      }


      //------------------------------------------------------------------------
      //------------------------------------------------------------------------

      append('body', `

            <div class='fix modal-info-attack' style='display: none;'>
                    <div class='abs modal-info-attack-c1'>

                          <div class='abs center modal-info-ini-attack'>

                          </div>

                    </div>

                    <div class='abs modal-info-attack-c2'>


                          <div class='abs center card-attack-go' style='color: red;'>

                                ATTACK
                                <br>
                                <i class='fa fa-arrow-right'></i>

                          </div>

                    </div>

                    <div class='abs modal-info-attack-c3'>

                        <div class='abs center modal-info-fin-attack'>

                        </div>

                    </div>
            </div>

      `);

      //------------------------------------------------------------------------
      //------------------------------------------------------------------------


    },
    renderCss: async ()=>{
      //------------------------------------------------------------------------
      //------------------------------------------------------------------------
      let style_card_content = `
        <style>
              .card-content-template {

                width: 90%;
                height: 90%;
                top: 5%;
                left: 5%;
                border: 2px solid yellow;

              }

              .card-content-body {

                width: 100%;
                height: 80%;
                top: 0%;
                left: 0%;
                border: 2px solid yellow;

              }

              .card-content-attack {

                top: 80%;
                height: 20%;
                left: 0%;
                width: 50%;
                border: 2px solid yellow;
                color: red;

              }

              .card-content-life {

                top: 80%;
                height: 20%;
                left: 50%;
                width: 50%;
                border: 2px solid yellow;
                color: green;

              }

        </style>
      `;
      append('body', style_card_content);
      //------------------------------------------------------------------------
      //------------------------------------------------------------------------
    },
    onEvent: async ()=>{


      //------------------------------------------------------------------------
      //------------------------------------------------------------------------
      let iniAttack = null;
      let finAttack = null;

      let ind = 0;
      for(let card of cards.service.getAllcard()){
          let idEvent = ind;
          let classEvent = '.card-'+idEvent;
          s(classEvent).onclick = ()=>{

            //   htmls('.modal-info-ini-attack',cards.service.renderCardBody(idEvent, card));

            if(iniAttack==null&&finAttack==null){
              iniAttack=idEvent;
              htmls('.modal-info-ini-attack',cards.service.renderCardBody(idEvent, card));
              fadeIn(s('.modal-info-attack'));
            }

            else if(iniAttack!=null&&finAttack==null){
              if(iniAttack!=idEvent){
                finAttack=idEvent;
                htmls('.modal-info-fin-attack',cards.service.renderCardBody(idEvent, card));
              }else{
                iniAttack=null;
                htmls('.modal-info-ini-attack','');
                fadeOut(s('.modal-info-attack'));
              }
            }

            else if(iniAttack!=null&&finAttack!=null){
              finAttack=null;
              iniAttack=null;
              htmls('.modal-info-fin-attack','');
              htmls('.modal-info-ini-attack','');
              fadeOut(s('.modal-info-attack'));
            }

          };
          ind++;
      }

      //------------------------------------------------------------------------
      //------------------------------------------------------------------------

      s('.card-attack-go').onclick = ()=>{


        if(iniAttack!=null&&finAttack!=null){

          let iniCard = cards.service.getCard({ind: iniAttack});
          let finCard = cards.service.getCard({ind: finAttack});
          let newLife = finCard.life-iniCard.attack;
          cards.service.updateLifeCard({
            ind: finAttack,
            life: newLife
          });
          htmls('.card-stat-life-'+finAttack,newLife);

          notifiValidator.service.display(true, 'success attack', 1000);

        }else{

          notifiValidator.service.display(false, 'not valid state attack', 1000);

        }

      }







      //------------------------------------------------------------------------
      //------------------------------------------------------------------------


    }
  },
  service: {
    renderCardBody: (ind, card)=>{
      return `
            `+card.fontAwesome+`
            <br>
            <i class="fas fa-`+card.fontAwesome+`"></i>
            <br>
            id:`+ind+`
      `;
    },
    cards: [
      {
        attack: 2,
        life: 1,
        fontAwesome : 'jedi',
        cell_x: 0,
        cell_y: 0
      },
      {
        attack: 1,
        life: 1,
        fontAwesome : 'atom',
        cell_x: 1,
        cell_y: 1
      }
    ],
    getAllcard: ()=>{
      return cards.service.cards;
    },
    getCard: (obj)=>{
      return cards.service.cards[obj.ind];
    },
    updateLifeCard: (obj)=>{
      cards.service.cards[obj.ind].life=obj.life;
    }
  },
  render: async () =>{}
}
