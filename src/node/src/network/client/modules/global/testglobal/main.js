const testglobal = {
  loader: async ()=>{

    append('body', ' content global <br>');

    s('body').onkeydown = () => {
    		switch (window.event.keyCode) {
    			case 13:
    					notifi.display('pink', 'test', 1000, 'failed');
    				break;
    			default:
    		}
    };
  },
  render: async ()=>{}
};
