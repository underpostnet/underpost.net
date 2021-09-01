import { Block } from "./block.js";
import { Util } from "../../../../util/class/Util.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { RestService } from "../../../../rest/class/restService.js";
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

	async setCurrentChain(){

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

			let bridgeChain = await new RestService().getJSON(
				this.userConfig.bridgeUrl+'/'+this.generation
			);

			let localChain = JSON.parse(fs.readFileSync(
				(this.userConfig.blockChainDataPath+'/generation-'+this.generation+'/chain.json'),
				this.userConfig.charset
			));

			new Util().l(bridgeChain) >= new Util().l(localChain) ?
			await setBlockClass(bridgeChain, true) :
			await setBlockClass(localChain, false) ;

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
			new Util().l(returnZeros) < 1 ? returnZeros = "0" : null;
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

	async addBlock(obj) {

		console.log('\n---------------------------------------');
		console.log(colors.yellow('NEW BLOCK | '+new Date().toLocaleString()));
		console.log(obj.blockConfig);
    let block = new Block();
		await block.mineBlock(obj);
    this.chain.push(block);
		this.calculateCurrentRewardDelivered();
		this.calculateZerosAvgTimeBlock();

		let globalValidate = await this.globalValidateChain();
		globalValidate.hashValidate == true
		&&
		globalValidate.signValidate == true
		&&
		globalValidate.rewardValidate == true
		? console.log('propagate ->') : null;
		// await this.startBlockPropagation()

	}

	async globalValidateChain(chain){

		let hashValidate = false;
		let signValidate = false;
		let rewardValidate = false;

	 // siempre los sing comprobar cyberia en true el promedio de  tiempo es
	 // digamos 10 min, poca carga para el servidor
	 // centrar en cyberia la moneda el hash

		if(chain != undefined){
				await this.setNewChainAndBlockClass(chain);
				signValidate = true;
				rewardValidate = true;
				for(let block of this.chain){
					if(! await this.validateSignAppNode(block.node.dataApp, true)){
						signValidate = false;
					}
					if(! this.validateRewardBlock(block)){
						rewardValidate = false;
					}
				}
		}else{
			 signValidate =
			 await this.validateSignAppNode(this.latestBlock().node.dataApp, false);
			 rewardValidate =
			 this.validateRewardBlock(this.latestBlock());
		}
		hashValidate = this.checkValid();

		// validate reward with genesis

		// validate transactions

		console.log(colors.cyan('validator-status:'+hashValidate));
		console.log(colors.cyan('check-app-sign:'+signValidate));
		console.log(colors.cyan('reward-block-validate:'+rewardValidate));

		return { hashValidate, signValidate, rewardValidate };
	}

	async startBlockPropagation(){
		const bridgePropagation = async () => {
			return await new RestService().postJSON(
						this.userConfig.bridgeUrl+'/block',
						this.latestBlock()
			);
		};
		console.log(colors.cyan('bridge-propagation-status:'+await bridgePropagation()));
	}

	checkValid() {
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
		return true;
	}

	async validateSignAppNode(blockNode, allBlockValidate){
		for(let signObj of blockNode){
			let countAttempts = 0;
			const attempt = async () => {
				// console.log(colors.yellow("init-validate-sign"));
				// console.log(colors.yellow("url:"+signObj.url));
				// console.log(colors.yellow("attempt:"+(countAttempts+1)));
				let signResult = await new RestService().postJSON(
							signObj.url+'/validate', {
							sign: signObj.sign,
							generation: parseInt(this.generation),
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

		return true;

	}

	async mainProcess(obj){
		await this.setCurrentChain();
		await this.setRewardConfig();
		for(let i=0; i<(this.userConfig.blocksToUndermine); i++){
			switch (new Util().l(this.chain)) {
				case 0:
					await this.addBlock({
						rewardAddress: this.userConfig.rewardAddress,
						paths: obj.paths,
						blockConfig: this.currentBlockConfig(),
						dataGenesis: this.genesisBlockChainConfig()
					})
				default:
					await this.addBlock({
						rewardAddress: this.userConfig.rewardAddress,
						paths: obj.paths,
						blockConfig: this.currentBlockConfig()
					})
			}
		}
		switch (this.userConfig.blockChainDataPath) {
			case null:
					this.saveChain('../data/blockchain');
				break;
			default:
				  this.saveChain(this.userConfig.blockChainDataPath);
		}
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
			new Util().jsonSave(this.chain),
			this.userConfig.charset
		);

		fs.writeFileSync(
			path_save+'/generation-'+this.generation+'/hash',
			this.hashGeneration,
			this.userConfig.charset
		);

	}

}
