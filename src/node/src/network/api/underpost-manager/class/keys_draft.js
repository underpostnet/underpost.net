async keysGestor(){

  // await !fs.existsSync(data.dataPath+'keys') ?
  // fs.mkdirSync(data.dataPath+'keys'):null;

  console.log(colors.yellow
             ("---------------------------"));
  console.log("       KEY GESTOR");
  console.log(colors.yellow
             ("---------------------------"));
  console.log("1 > Create symmetric Key");
  console.log("2 > Create asymmetric Key");
  console.log("3 > exit");
  console.log(colors.yellow
             ("---------------------------"));

  /* never save real password */

  /* let option = new ReadLine().r("Enter option: ");

  switch (option) {
    case 1:
        let symmetricPass = await new ReadLine().h('symmetric key password: ');
        data.symmetricKeys.push(await new Keys().generateSymmetricKeys({
          passphrase: symmetricPass,
          path: data.dataPath+'keys'
        }));
      break;
    case 2:
      let asymmetricPass = await new ReadLine().h('asymmetric key password: ');
      data.asymmetricKeys.push(await new Keys().generateAsymmetricKeys({
        passphrase: asymmetricPass,
        path: data.dataPath+'keys'
      }));
      break;
    default:
      console.log("invalid option");
  } */


}
