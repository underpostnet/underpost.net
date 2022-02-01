import { Block } from "./block.js";
import { Util } from "../../../../util/class/Util.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { RestService } from "../../../../rest/class/restService.js";
import { Paint } from "../../../../paint/class/paint.js";
import { Keys } from "../../../../keys/class/Keys.js";
import SHA256 from "crypto-js/sha256.js";
import fs from "fs";
import colors from "colors/safe.js";


export class BlockChain {

	constructor(obj) {

		this.generation = obj.generation;

		this.userConfig = obj.userConfig;

		! obj.validatorMode ? ((()=>{

			this.version = obj.version;

			this.setPreviousHahsGeneration(obj.pathPreviousHashGeneration);

			this.difficultyConfig = obj.difficultyConfig;

			this.rewardConfig = Object.assign(
				{
					era: [],
					reward: [],
					blocks: [],
					rewardPerBlock: [],
					rewardCurrencyPerBlock: [],
					sumBlocks: 0,
					sumReward: 0
				},
				obj.rewardConfig
			);

			obj.userConfig.blocksToUndermine == null ?
			this.userConfig.blocksToUndermine =
			( obj.rewardConfig.totalEra + 1 )
			: null;

		})()) : null ;

	}


	async setNewChainAndBlockClass(arr){
		this.chain = arr;
		let indexBlock = 0;
		for(let block of this.chain){
			this.chain[indexBlock] = new Block();
			await this.chain[indexBlock].setValues(block);
			indexBlock++;
		}
	}

	async setCurrentChain(validate){

		const setBlockClass = async (arr, rest) => {

			await this.setNewChainAndBlockClass(arr);

			rest ?
			((()=>{
				console.log(colors.yellow(' > GET BRIDGE CHAIN'));
				this.saveChain(this.userConfig.blockChainDataPath);
			})())  :
			console.log(colors.yellow(' > GET LOCAL CHAIN')) ;

		};

		const setValidateChain = async () => {

			let localChain = JSON.parse(fs.readFileSync(
				(this.userConfig.blockChainDataPath+'/generation-'+this.generation+'/chain.json'),
				this.userConfig.charset
			));

			/*let bridgeChain = localChain.concat(await new RestService().getJSON(
				this.userConfig.bridgeUrl+'/chain/'+this.generation
				+'/'+new Util().l(localChain)+'/last'
			));*/

			let bridgeChainLen = parseInt(await new RestService().getJSON(
				this.userConfig.bridgeUrl+'/chain-len/'+this.generation
			));

			console.log(colors.yellow("bridge chain len:"+bridgeChainLen));
			console.log(colors.yellow("local chain len:"+localChain.length));
			console.log(colors.yellow("difference length chain bridge:"+
			(bridgeChainLen-localChain.length)));

			if(bridgeChainLen>new Util().l(localChain)){

				let bridgeChain = localChain;
				for(let indexBlock of new Util().range(localChain.length, (bridgeChainLen-1))){
					console.log(colors.green("get block index:"+indexBlock));
					let reqUrl =
					this.userConfig.bridgeUrl
					+'/block/'+this.generation
					+'/'
					+indexBlock;
					console.log(colors.green("url:"+reqUrl));
					let newBlock = await new RestService().getJSON(reqUrl);
					// console.log(newBlock);
					bridgeChain.push(newBlock);
				}

					await setBlockClass(bridgeChain, true);

			}else {

					await setBlockClass(localChain, false);
			}

			// console.log(new Util().l(this.chain));
			validate!=undefined ? await this.globalValidateChain(this.chain) : null;


		};


		if(!fs.existsSync(this.userConfig.blockChainDataPath+'/generation-'+this.generation)){
			fs.mkdirSync(this.userConfig.blockChainDataPath+'/generation-'+this.generation);
			fs.writeFileSync(
				this.userConfig.blockChainDataPath+'/generation-'+this.generation+'/chain.json',
				new Util().jsonSave([]),
				this.userConfig.charset
			);
		}

		this.userConfig.blockChainDataPath == null ?
		this.chain = [] : this.userConfig.bridgeUrl == null ?
		this.chain = [] : await setValidateChain() ;




		this.totalBlockObjetive = new Util().l(this.chain)+this.userConfig.blocksToUndermine;

	}

	async setRewardConfig(){

		for(let i of new Util().range(0, this.rewardConfig.totalEra)){

			this.rewardConfig.era.push(i);

			this.rewardConfig.reward.push(
			(this.rewardConfig.intervalChangeEraBlock*
				((50*(10**8))/(2**i)))/(10**8)
			);

			this.rewardConfig.rewardPerBlock.push(
				this.rewardConfig.reward[
					(new Util().l(this.rewardConfig.reward)-1)
				]
				/	this.rewardConfig.intervalChangeEraBlock
			);

			this.rewardConfig.rewardCurrencyPerBlock.push(

			Math.trunc(

				(this.rewardConfig.reward[(new Util().l(this.rewardConfig.reward)-1)]

				/	this.rewardConfig.intervalChangeEraBlock)*this.rewardConfig.upTruncFactor)

			);

			this.rewardConfig.sumBlocks += this.rewardConfig.intervalChangeEraBlock;
			this.rewardConfig.sumReward += this.rewardConfig.rewardCurrencyPerBlock[
				(new Util().l(this.rewardConfig.reward)-1)
			];
			this.rewardConfig.blocks.push(this.rewardConfig.sumBlocks);

		}

		// console.log(colors.yellow('rewardConfig BlockChain ->'));
		// console.log(this.rewardConfig);

		this.userConfig.blockChainDataPath == null ?
		fs.writeFileSync(
	    '../data/rewardConfig.json',
	    new Util().jsonSave(this.rewardConfig),
	    this.userConfig.charset
	  ) :
		fs.writeFileSync(
	    this.userConfig.blockChainDataPath+'/generation-'+this.generation+'/rewardConfig.json',
	    new Util().jsonSave(this.rewardConfig),
	    this.userConfig.charset
	  ) ;

	}

	setPreviousHahsGeneration(path){
		path == null ?
		this.previousHashGeneration = SHA256(
			new Util().JSONstr(this.dataGenesisHashGeneration)
		).toString():
		this.previousHashGeneration = fs.readFileSync(path, this.userConfig.charset);
	}

  currentBlockConfig(){
		let diff = this.calculateDifficulty();
    switch (new Util().l(this.chain)) {
      case 0:
        return {
          index: 0,
          previousHash: SHA256(
						new Util().JSONstr(this.genesisBlockChainConfig())
					).toString(),
          reward: this.calculateReward(),
          difficulty: {
						zeros: diff.zeros,
						targetHash: diff.target,
						difficulty: diff.difficulty
					},
					date: (+ new Date()),
					version: this.version,
					generation: this.generation,
					previousHashGeneration: this.previousHashGeneration
        }
      default:
        return {
          index: this.latestBlock().block.index + 1,
          previousHash: this.latestBlock().hash,
          reward: this.calculateReward(),
					difficulty: {
						zeros: diff.zeros,
						targetHash: diff.target,
						difficulty: diff.difficulty
					},
					date: (+ new Date()),
					version: this.version,
					generation: this.generation,
					previousHashGeneration: this.previousHashGeneration
        }
    }
  }

	genesisBlockChainConfig(){
		return {
			difficultyConfig: this.difficultyConfig,
			rewardConfig: this.rewardConfig,
			generation: this.generation,
		  version: this.version,
			previousHashGeneration: this.previousHashGeneration
		}
	}

	latestBlock() {
		return new Util().getLastElement(this.chain);
	}

  calculateReward(){
		const genereteHashsKoyn = rewardCurrency => {
			// esta funcion disminuye en factor de 30 el rendimiento
			let reward = [];
			for(let iCurrency of new Util().range(1, rewardCurrency)){
				let hashsKoyn = [];
				for(let iHash in new Util().range(1, this.rewardConfig.hashesPerCurrency)){
					hashsKoyn.push(new Util().getHash());
				}
				reward.push(hashsKoyn);
			}
			return {
				totalValue: new Util().l(reward),
				hashs: reward
			};
		};
		if(!(this.userConfig.hashToken == true)){
			switch (new Util().l(this.chain)) {
				case 0:
					return {
						totalValue: this.rewardConfig.rewardCurrencyPerBlock[0],
						hashs: []
					};
				default:
					return {
						totalValue: this.getRewardToIndexBlock(this.latestBlock(), this.rewardConfig, true),
						hashs: []
					};
			}
		}
		switch (new Util().l(this.chain)) {
			case 0:
				return genereteHashsKoyn(this.rewardConfig.rewardCurrencyPerBlock[0]);
			default:
				return genereteHashsKoyn(this.getRewardToIndexBlock(this.latestBlock(), this.rewardConfig, true));
		}
  }

	getRewardToIndexBlock(block, rewardConfig, next){
		let indexBlock = null;
		next ? indexBlock = block.block.index+1 : indexBlock = block.block.index ;
		for(let i of new Util().range(1, rewardConfig.totalEra)){
			if((rewardConfig.blocks[i-1]<=indexBlock)&&(indexBlock<rewardConfig.blocks[i])){
				return rewardConfig.rewardCurrencyPerBlock[i];
			}
		}
		return 0;
	}

  calculateDifficulty(){

		const numberTo64BitBigInt = (x) => {
			const lo = x | 0;
			const rawHi = (x / 4294967296.0) | 0; // 2^32
			const hi = (x < 0 && lo != 0) ? (rawHi - 1) | 0 : rawHi;
			return (BigInt(hi) << 32n) | BigInt(lo >>> 0);
		}

		const diffToTarget = (diff) => {
			var buf = Buffer.alloc(32).fill(0);

			if(!isFinite(diff) || diff <= 0) {
				buf.fill(0xff);
				return buf.toString('hex');
			}
			var k = 6;
			for (; k > 0 && diff > 1.0; k--) {
				diff /= 4294967296.0;
			}
			var m = BigInt(numberTo64BitBigInt((4.294901760e+9 / diff)))
			buf.writeUInt32LE(Number(0xffffffffn & m) >>> 0, k << 2);
			buf.writeUInt32LE(Number(m >> 32n) >>> 0, 4 + (k << 2));
			return buf.toString('hex');
		};

		const getZerosHash = (hash) => {
			let charList = [];
			for(let char of hash){
				charList.push(char);
			}
			charList = charList.reverse();
			let target = "";
			for(let char of charList){
				if(char=="0"){
					target+=char;
				}else{
					break;
				}
			}
			return target;
		};

		const getDiff = (obj) => {
		  return  ((obj.intervalSecondsTime*obj.hashRateSeconds)
								/Math.pow(2, 32))
		};

		const getDynamicDiff = () => {

			let from_ = new Util().l(this.chain)-this.difficultyConfig.intervalCalculateDifficulty;

			let lastDate = this.chain[from_].block.date;
			let currentDate = (+ new Date());
			let intervalSecondsTime = ((currentDate-lastDate)/1000);
			let totalNonce = 0;

			for(let i=from_;i<new Util().l(this.chain);i++){
 				totalNonce += this.chain[i].nonce;
			}
			let hashRateSeconds = intervalSecondsTime / totalNonce ;

			let currentDiff = getDiff({
				intervalSecondsTime: intervalSecondsTime,
				hashRateSeconds: hashRateSeconds
			});
			let expectedDiff = getDiff({
				intervalSecondsTime: this.difficultyConfig.intervalSecondsTime,
				hashRateSeconds: hashRateSeconds
			});

			let differenceFactor = expectedDiff / currentDiff ;

			differenceFactor < 1 ? differenceFactor =
			differenceFactor * this.difficultyConfig.intervalSecondsTime: null;

			console.log(colors.cyan('recalculate-difficulty-factor:'+differenceFactor));

			let newDiff = this.latestBlock().block.difficulty.difficulty * differenceFactor;

			new Util().l(getZerosHash(diffToTarget(newDiff*1.02))) <
			new Util().l(getZerosHash(diffToTarget(newDiff))) ?
			newDiff = newDiff*1.02 : null;
			/*new Util().l(getZerosHash(diffToTarget(newDiff*0.98))) >
			new Util().l(getZerosHash(diffToTarget(newDiff))) ?
			newDiff = newDiff*0.98 : null ;*/

			return differenceFactor == 1 ? this.latestBlock().block.difficulty.difficulty : newDiff;

		};

		const formatDiff = (diff) => {
			let returnTarget = diffToTarget(diff);
			let returnZeros = getZerosHash(returnTarget);
			new Util().l(returnZeros) < new Util().l(this.userConfig.minimumZeros) ? returnZeros = this.userConfig.minimumZeros : null;
			return {
				zeros: returnZeros,
				target: returnTarget,
				difficulty: diff
			};
		};

		const processDiff = (genesis) => {
			let returnDifficulty =	genesis ?
			getDiff(this.difficultyConfig) :
			getDynamicDiff();
			return formatDiff(returnDifficulty);
		};

		if( new Util().l(this.chain) % this.difficultyConfig.intervalCalculateDifficulty == 0 ){
			switch (this.userConfig.zerosConstDifficulty == null) {
				case true:
					switch (new Util().l(this.chain)) {
						case 0:
							return processDiff(true);
						default:
							return processDiff(false);
					}
				default:
					return {
						zeros: this.userConfig.zerosConstDifficulty,
						target: null,
						difficulty: null
					}
	  	}
		}else{
			return {
				zeros: this.latestBlock().block.difficulty.zeros,
				target: this.latestBlock().block.difficulty.targetHash,
				difficulty: this.latestBlock().block.difficulty.difficulty
			}
		}

	}

	async addBlock(obj, ws) {

		console.log('\n---------------------------------------');
		console.log(colors.yellow('NEW BLOCK | '+new Date().toLocaleString()));
		console.log(obj.blockConfig);
    this.newBlock = new Block();

		let blockProcess = await this.newBlock.mineBlock(
			obj,
			ws,
			this.userConfig.intervalBridgeMonitoring);

    if(blockProcess.status == true){

			let globalValidate = await this.globalValidateChain();

			if(globalValidate.global == true
				&&
				this.userConfig.propagateBlock == false){
					this.endAddProcessBlock();
					return blockProcess;
			}

			if(globalValidate.global == true
				&&
				this.userConfig.propagateBlock == true){

				let propagationStatus = await this.startBlockPropagation();
				if(propagationStatus == true){
					this.endAddProcessBlock();
					return blockProcess;
				}else{
					console.log(colors.red('wsBridge Rejected Block'));
					blockProcess.status = false;
					return blockProcess;
				}

			}

			console.log(colors.red('Invalid last Block'));
			blockProcess.status = false;
			return blockProcess;

		}else{

			console.log(colors.red('disrupted mine block process'));
			return blockProcess;

		}

	}

	endAddProcessBlock(){
		this.chain.push(this.newBlock);
		this.calculateCurrentRewardDelivered();
		this.calculateZerosAvgTimeBlock();
	}

	async globalValidateChain(chain){

		let hashValidate = false;
		let signValidate = false;
		let rewardValidate = false;
		let keysValidate = false;
		let sizeValidate = true;
		let timeTransactionValidate = true;
		let validateSignsTransactions = true;
		let typeValidate = 'last-validate-block';

	 // siempre los sing comprobar cyberia en true el promedio de  tiempo es
	 // digamos 10 min, poca carga para el servidor
	 // centrar en cyberia la moneda el hash

		if(chain != undefined){
				await this.setNewChainAndBlockClass(chain);
				signValidate = true;
				rewardValidate = true;
				keysValidate = true;
				typeValidate = 'all-validate-block';
				for(let block of this.chain){
					if(! await this.validateSignAppNode(block.node.dataApp, true)){
						signValidate = false;
					}
					if(! this.validateRewardBlock(block)){
						rewardValidate = false;
					}
					if(! this.validateKeysBlock(block)){
						keysValidate = false;
					}
					if(new Util().getSizeJSON(block).megaBytes>this.userConfig.limitMbBlock){
						sizeValidate = false;
					}
				}
				if(this.validateTimesTransactions()==false){
					timeTransactionValidate = false;
				}
				validateSignsTransactions = await
				this.validateSignsTransactions(
						this.userConfig.dataDir,
						this.userConfig.dataFolder
				);
				hashValidate = this.checkValid();
		}else{
			 signValidate =
			 await this.validateSignAppNode(this.newBlock.node.dataApp, false);
			 rewardValidate =
			 this.validateRewardBlock(this.newBlock);
			 keysValidate =
			 this.validateKeysBlock(this.newBlock);
			 hashValidate = this.checkValid(this.newBlock);
			 if(new Util().getSizeJSON(this.newBlock).megaBytes>this.userConfig.limitMbBlock){
				 sizeValidate = false;
			 }
			 if(this.validateTimesTransactions(this.newBlock)==false){
				 timeTransactionValidate = false;
			 }
			 validateSignsTransactions = await
			 this.validateSignsTransactions(
 					this.userConfig.dataDir,
 					this.userConfig.dataFolder,
 					this.newBlock);
		}

		console.log(colors.magenta('type-validate:'+typeValidate));
		console.log(colors.cyan('validator-status:'+hashValidate));
		console.log(colors.cyan('check-app-sign:'+signValidate));
		console.log(colors.cyan('reward-block-validate:'+rewardValidate));
		console.log(colors.cyan('size-validate:'+sizeValidate));
		console.log(colors.cyan('keys-validate:'+keysValidate));
		console.log(colors.cyan('time-transactions-validate:'+timeTransactionValidate));
		console.log(colors.cyan('signs-transactions-validate:'+validateSignsTransactions))

		return { hashValidate,
						signValidate,
						rewardValidate,
						sizeValidate,
						keysValidate,
						timeTransactionValidate,
						validateSignsTransactions,
		global: ( hashValidate   &&
							signValidate   &&
							rewardValidate &&
							sizeValidate   &&
							timeTransactionValidate &&
							validateSignsTransactions &&
							keysValidate) };
	}

	validateKeysBlock(block){

		if(block.block.index!=0){

			let blockTemplate = new Util().fusionObj([this.chain[0]]);

			for(let transaction_ of block.node.dataTransaction){

				let transactionTemplate = new Util().uniqueArray(
					new Util().getAllKeys(blockTemplate.transactionTemplate)
				);

				let transactionBlock = new Util().uniqueArray(
					new Util().getAllKeys(transaction_)
				);

				if(!new Util().objEq(transactionTemplate, transactionBlock)){
					return false;
				}

			}

			delete blockTemplate.dataGenesis;
			delete blockTemplate.transactionTemplate;
			let auxBlock = new Util().newInstance(block);
			auxBlock.node.dataTransaction = [];

			let keysTemplate = new Util().uniqueArray(
				new Util().getAllKeys(blockTemplate)
			);

			let keysBlock = new Util().uniqueArray(
				new Util().getAllKeys(auxBlock)
			);

			// console.log("keysTemplate");
			// console.log(keysTemplate);
			// console.log("keysBlock");
			// console.log(keysBlock);

			return new Util().objEq(keysTemplate, keysBlock);

		}else{
			return true;
		}

	}

	validateTimesTransactions(block){

		if(block == undefined){

			let publicKeys = this.chain.
			map(x=>x.node.dataTransaction.
			map(x=>x.data.sender.data.base64PublicKey));

			let dataTransactionTest = [];
			for(let fix_ of publicKeys){
				dataTransactionTest = dataTransactionTest.concat(fix_);
			}
			dataTransactionTest = new Util().uniqueArray(dataTransactionTest);

			for(let key_test of dataTransactionTest){
				let times = [];
				for(let block_ of this.chain){
					for(let transaction of block_.node.dataTransaction){
						if(transaction.data.sender.base64PublicKey==key_test){
							times.push(transaction.data.createdDate);
						}
					}
				}
				let times_validate =
				new Util().sortArrAsc(
					new Util().uniqueArray(
						new Util().newInstance(times)
					)
				);

				if(!new Util().objEq(times, times_validate)){
					return false;
				}

			}

		}else{

			let publicKeys = block.node.dataTransaction.
			map(x=>x.data.sender.data.base64PublicKey);

			let dataTransactionTest = new Util().uniqueArray(publicKeys);

			for(let key_test of dataTransactionTest){
				let times = [];
				for(let transaction of block.node.dataTransaction){
					if(transaction.data.sender.base64PublicKey==key_test){
						times.push(transaction.data.createdDate);
					}
				}
				let times_validate =
				new Util().sortArrAsc(
					new Util().uniqueArray(
						new Util().newInstance(times)
					)
				);

				if(!new Util().objEq(times, times_validate)){
					return false;
				}

			}

		}

		return true;

	}

	async validateSignsTransactions(dataDir, dataFolder, block){

		if(block==undefined){

			for(let block of this.chain){
				for(let transaction of block.node.dataTransaction){
					let validateSign = await new Keys()
					.validateTempAsymmetricSignKey(
						transaction,
						this.userConfig.blockchain,
						this.userConfig.charset,
						this.userConfig.dataDir,
						this.userConfig.dataFolder);
					if(validateSign == false){
						return false;
					}
				}
			}

		}else{

			for(let transaction of block.node.dataTransaction){
				let validateSign = await new Keys()
				.validateTempAsymmetricSignKey(
					transaction,
					this.userConfig.blockchain,
					this.userConfig.charset,
					this.userConfig.dataDir,
					this.userConfig.dataFolder);
				if(validateSign == false){
					return false;
				}
			}

		}

		return true;

	}

	async startBlockPropagation(){
		console.log(colors.magenta('progagate block ...'));
		const bridgePropagation = async () => {
			// console.log("bridgePropagation ->");
			// console.log(this.latestBlock());
			return await new RestService().postJSON(
						this.userConfig.bridgeUrl+'/chain/block',
						this.clearBlock(
							new Util().newInstance(this.newBlock)
						)
			);
		};
		console.log(colors.cyan('bridge-propagation-status:'));
		let result = await bridgePropagation();
		console.log(result);
		return result.global;
	}

	clearBlock(obj){
		/*if(new Util().existAttr(obj, "stop")){
			delete obj.stop;
		}*/
		return obj;
	}

	clearChain(){
		let auxChain = [];
		for(let block of this.chain){
			auxChain.push(this.clearBlock(new Util().newInstance(block)));
		}
		return auxChain;
	}

	checkValid(block) {
		if(block!=undefined){
			this.chain.push(block);
		}
		for (let i = 1; i < new Util().l(this.chain); i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if(currentBlock.block.index!=i || previousBlock.block.index!=(i -1)){
				return false;
			}

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			if (currentBlock.block.previousHash !== previousBlock.hash) {
				return false;
			}
		}
		if(block!=undefined){
			this.chain.pop();
		}
		return true;
	}

	equalValidate(localChain, bridgeChain){
		let shortChain = [];
		let longChain = [];
		if(new Util().l(bridgeChain) > new Util().l(localChain)){
			shortChain = localChain;
			longChain = bridgeChain;
		}else{
			shortChain = bridgeChain;
			longChain = localChain;
		}
		for(let i=0; i< new Util().l(shortChain); i++){
			if(! new Util().objEq(shortChain[i], longChain[i])){
				console.log(colors.cyan('equal-validate-chain:'+false));
				return false;
			}
		};
		console.log(colors.cyan('equal-validate-chain:'+true));
		return true;
	}

	async validateSignAppNode(blockNode, allBlockValidate){
		if(this.userConfig.bridgeUrl!=null){
		for(let signObj of blockNode){
			let countAttempts = 0;
			const attempt = async () => {
				// console.log(colors.yellow("init-validate-sign"));
				// console.log(colors.yellow("url:"+signObj.url));
				// console.log(colors.yellow("attempt:"+(countAttempts+1)));
				let signResult = await new RestService().postJSON(
							signObj.url+'/validate', {
							sign: JSON.parse(signObj.data).sign,
							generation: this.generation,
							allValidate: allBlockValidate
				});
				// console.log("signResult ->");
				// console.log(signResult);
				if(signResult!==true && signResult!==false){
					console.log(colors.red("error validate sign"));
					countAttempts++;
					if(countAttempts < this.userConfig.maxErrorAttempts){
						await new Util().timer(this.userConfig.RESTdelay);
						return await attempt();
					}else{
						return false;
					}
				}else{
					return signResult;
				}
			};
			if(!await attempt()){
				return false;
			}
		}
		return true;
		}else{ return true }
	}

	validateRewardBlock(block){

		if(block.block.index == 0){
			return true;
		}

		let rewardConfig = this.chain[0].dataGenesis.rewardConfig;

		if(block.block.index>=new Util().getLastElement(rewardConfig.blocks)
		&& block.block.reward.totalValue == 0){
			return true;
		}else if(block.block.index<new Util().getLastElement(rewardConfig.blocks)
		&& block.block.reward.totalValue == 0){
			// console.log("test 1 ->");
			return false;
		}

		if(this.userConfig.hashToken == true){

		let valueHashKoyn = new Util().l(block.block.reward.hashs);

		if(valueHashKoyn!=block.block.reward.totalValue){
			// console.log("test 2 ->");
			return false;
		}

		// reward: { totalValue: 0, hashs: [] },
		if(this.getRewardToIndexBlock(block, rewardConfig, false)!=valueHashKoyn){
			// console.log("test 3 ->");
			return false;
		}

		} else{
			if(this.getRewardToIndexBlock(block, rewardConfig, false)
			!=
			block.block.reward.totalValue){
				// console.log("test 3 ->");
				return false;
			}
		}



		return true;

	}

	async mainProcess(obj, ws){
		await this.setCurrentChain(true);
		await this.setRewardConfig();
		let statusMainProcess = null;
		for(let i=1; i<=(this.userConfig.blocksToUndermine); i++){
			switch (new Util().l(this.chain)) {
				case 0:
					statusMainProcess = await this.addBlock({
						rewardAddress: this.userConfig.rewardAddress,
						paths: obj.paths,
						blockConfig: this.currentBlockConfig(),
						dataGenesis: this.genesisBlockChainConfig(),
						transactionTemplate: this.userConfig.transactionTemplate,
						limitMbBlock: this.userConfig.limitMbBlock
					}, ws);
					if(statusMainProcess.status == false){return statusMainProcess;}
					break;
				default:
					statusMainProcess = await this.addBlock({
						rewardAddress: this.userConfig.rewardAddress,
						paths: obj.paths,
						blockConfig: this.currentBlockConfig(),
						limitMbBlock: this.userConfig.limitMbBlock
					}, ws);
					if(statusMainProcess.status == false){return statusMainProcess;}
			}
		}
		return await this.endProcessSaveChain(statusMainProcess);
	}

	async endProcessSaveChain(statusMainProcess){
		return await new Promise(async resolve => {
			// console.log(colors.magenta('global-save-validate ->'));
			let globaSaveValidate = await this.globalValidateChain(this.chain);
			// console.log(globaSaveValidate);

			if( globaSaveValidate.global == true ){
				try{
					switch (this.userConfig.blockChainDataPath) {
						case null:
								this.saveChain('../data/blockchain');
							break;
						default:
							  this.saveChain(this.userConfig.blockChainDataPath);
					}
					console.log(colors.magenta("success > save chain"));
					resolve(statusMainProcess);
				}catch(err){
					// console.log(err);
					statusMainProcess.status = false;
					console.log(colors.red("error > save chain"));
					resolve(statusMainProcess);
				}
			}else{
				statusMainProcess.status = false;
				console.log(colors.red("error > corrupt chain"));
				resolve(statusMainProcess);
			}
		});
	}

	calculateCurrentRewardDelivered(){
		let currentReward = 0;
		for(let block of this.chain){
			block.block.reward ?
			currentReward += block.block.reward.totalValue : null;
		}
		console.log(colors.cyan('current-reward-delivered:'+currentReward));
	}

	calculateZerosAvgTimeBlock(){

		let lastZeros = this.latestBlock().block.difficulty.zeros;
		let fromZeros = this.latestBlock().block.index;

		try {
			while(

				(this.chain[fromZeros].block.index)
				%
				this.difficultyConfig.intervalCalculateDifficulty != 0

			){
				fromZeros--;
			}
		}catch(negativeIndex){
			fromZeros = 0;
		}

		let sumTimeIntervalBlock = ((+ new Date())-this.chain[fromZeros].block.date)/1000;
		let contIntervalBlock = 0;
		let sumNonce = 0;

		for(let i=fromZeros; i<new Util().l(this.chain); i++){
			contIntervalBlock++;
			sumNonce += this.chain[i].nonce;
		}

		let avgReturn = ( sumTimeIntervalBlock / contIntervalBlock ).toFixed(2);
		let avgHashRate = ( sumNonce / sumTimeIntervalBlock ).toFixed(2);

		console.log(colors.cyan('current-avg-from-index-data:'+fromZeros));
		console.log(colors.cyan('current-avg-block-time:'+avgReturn+' s'));
		console.log(colors.cyan('current-avg-hash-rate:'+avgHashRate+' hash/s'));

		if((this.latestBlock().block.index==(this.totalBlockObjetive-1))
			&& (this.userConfig.zerosConstDifficulty!=null) ){

			let pathZeros;
			this.userConfig.blockChainDataPath == null ?
			pathZeros =
			'../data/zeros-test/'+this.userConfig.zerosConstDifficulty+'.json' :
			pathZeros =
			this.userConfig.blockChainDataPath+'/zeros-test/'+this.userConfig.zerosConstDifficulty+'.json';

			let currentZerosData = [];
			if (fs.existsSync(pathZeros)){
				currentZerosData =  JSON.parse(
					fs.readFileSync(pathZeros, {encoding:this.userConfig.charset})
				);
			}

			currentZerosData.push({
				avgTimeBlock: avgReturn,
				avgHashRate: avgHashRate
			});

			fs.writeFileSync(
				pathZeros,
				new Util().jsonSave(currentZerosData),
				this.userConfig.charset
			);

		}
	}

	saveChain(path_save){

		this.hashGeneration = SHA256(
			new Util().JSONstr(this.chain)
		).toString();

		fs.writeFileSync(
			path_save+'/generation-'+this.generation+'/chain.json',
			new Util().jsonSave(this.clearChain()),
			this.userConfig.charset
		);

		fs.writeFileSync(
			path_save+'/generation-'+this.generation+'/hash',
			this.hashGeneration,
			this.userConfig.charset
		);

	}

	async currentAmountCalculator(base64PublicKey, log, dataTransaction){

		if(dataTransaction!=undefined){
			this.chain.push({
				node: {
					dataTransaction: dataTransaction
				},
				block: {
					index: new Util().l(this.chain)
				}
			});
		}

		/*

		data:   sender   { doc }
						receiver { doc }
						amount {"totalValue": 750,
					                "hashs": [ [],[],[] ]
							}
						createdDate: (+ new Date())
		sign:

		*/

		let amount = 0;
		let hashs = [];
		for(let block of this.chain){

			if(this.validateTimesTransactions(block)==false){
				return null;
			}

			let validateSignsTransactions = await
			this.validateSignsTransactions(
					this.userConfig.dataDir,
					this.userConfig.dataFolder,
					block);

			if(validateSignsTransactions==false){
				return null;
			}

			for(let transaction of block.node.dataTransaction){

				//----------------------------------------------------------------------
				// sender validator
				//----------------------------------------------------------------------
				if(transaction.data.sender.data.base64PublicKey == base64PublicKey){
					if(amount >= transaction.data.amount.totalValue){
						let count_value = 0;
						for(let hashs_transaction of transaction.data.amount.hashs){
							let ind = 0;
							for(let hash_current of hashs){
								if(new Util().objEq(hash_current, hashs_transaction)){
									hashs[ind] = null;
									count_value++;
								}
								ind++;
							}
						}
						if((count_value == transaction.data.amount.totalValue)||(!(this.userConfig.hashToken==true))){
							amount = amount - transaction.data.amount.totalValue;
							hashs = hashs.filter(x=>x!=null);
							log == true ? new Paint().underpostOption('yellow', ' ', `
							sender validator amount: `+transaction.data.amount.totalValue+`
							current amount:          `+amount+`
							`) : null;
						}else{
							new Paint().underpostOption('red', 'error', 'invalid current amount for transaction');
							return null;
						}
					}else{
						new Paint().underpostOption('red', 'error', 'invalid current amount for transaction');
						return null;
					}
				}
				//----------------------------------------------------------------------
				// receiver validator
				//----------------------------------------------------------------------

				if(transaction.data.receiver.data.base64PublicKey == base64PublicKey){
					amount = amount + transaction.data.amount.totalValue;
					hashs = hashs.concat(transaction.data.amount.hashs);
					log == true ? new Paint().underpostOption('green', ' ', `
		index block                      : `+block.block.index+`
		receiver transaction amount      : `+transaction.data.amount.totalValue+`
		current amount                   : `+amount+`
					`): null;
				}

				//----------------------------------------------------------------------
				//----------------------------------------------------------------------


			}
			if(block.node.rewardAddress == base64PublicKey){
				amount += block.block.reward.totalValue;
				hashs = hashs.concat(block.block.reward.hashs);
				log == true ? new Paint().underpostOption('green', ' ', `
	index block                      : `+block.block.index+`
	receiver reward validator amount : `+block.block.reward.totalValue+`
	current amount                   : `+amount+`
				`): null;
			}
		}

		if(this.validateTimesTransactions()==false){
			return null;
		}

		let validateSignsTransactions = await
		this.validateSignsTransactions(
				this.userConfig.dataDir,
				this.userConfig.dataFolder
		);

		if(validateSignsTransactions==false){
			return null;
		}

		return { amount, hashs };

	}

}
