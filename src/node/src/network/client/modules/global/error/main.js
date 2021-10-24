const error = {
  loader: async () => {

    append('body', `
      <br>
      <br>
      <br>
      <img class="in banner-error" src='/img/underpost-social.jpg'>
      <br>
      <br>
      <div class='in' style='text-align: center;'>
          <b>Error `+data.const.error_id+`</b>
      </div>
    `)

  },
  render: async () => {


  }
};
