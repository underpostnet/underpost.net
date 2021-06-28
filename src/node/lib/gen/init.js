let var_dump = require('var_dump');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

console.log('- - - - - - - - - - - - - - - - - - - - - -');
console.log(' development environment generator system ');
console.log('- - - - - - - - - - - - - - - - - - - - - -');

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

rl.question('TECH SELECT -> ¿PHP/NODEJS?:', (res) => {
	console.log(res);
	rl.close();
});

//-----------------------------------------------------------------------
//-----------------------------------------------------------------------

/* se debe ejecutar todo lo requerido bajar
primero y luego ejecutar de forma autonoma */

/*

if (!fs.existsSync(dir+'modules')){

	fs.mkdirSync(dir+'modules');

}

*/






























//-----------------------------------------------------------------------
// END
//-----------------------------------------------------------------------
