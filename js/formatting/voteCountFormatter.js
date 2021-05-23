const seperator = ',';
const block = ':';
const selectors = {
	players: ['playerList', 'players'],
	slots: ['slotList', 'slots', 'replacementlist', 'replacements'],
	alias: ['nicknameList', 'nicknames', 'alias', 'aliasList'],
	moderators: ['moderatorList', 'moderators', 'moderatorNames'],
	dead: ['deadList', 'dead', 'eliminated'],
	days: ['dayStartNumbers', 'dayStart', 'days'],
	deadline: ['deadline', 'timer'],
	prods: ['prodTimer', 'prod'],
	countdown: ['prods', 'timer', 'prodTimer', 'countdown'],
	pageData: ['pageData'],
	correctionWeight: ['correctionWeight, correction'],
	edash: ['edash', 'edashweight'],
	edashOnTop: ['edashOnTop'],
};
function containsSelector(sel, selRef) {
	return selRef.includes(sel);
}
function findSelector(sel) {
	for (const selector in selectors) {
		if (containsSelector(sel, selectors[selector])) {
			return { handle: selector, request: sel, selectors: selectors[selector] };
		}
	}
	return null;
}

function defaultFunc(settings) {
	let s = new SettingsFormat(settings);
	return s.data;
}

class SettingsFormat {
	constructor(settings = null) {
		this.data = {
			players: [],
			slots: {},
			alias: {},
			totalnames: [],
			moderators: [],
			dead: [],
			deadPost: {},
			days: ['0'],
			votes: {
				reg: {
					id: '0',
					vote: 'VOTE: ',
					unvote: 'UNVOTE: ',
				},
				hurt: {
					id: '1',
					vote: 'HURT: ',
					unvote: 'HEAL: ',
				},
			},
			pageData: null,
			voteWeight: {
				reg: 1,
			},
			edash: 2,
			edashOnTop: 1,
			correctionWeight: 0.5,
		};
		this.baseUrl = '';
		if (settings) this.parseSettings(settings);
	}
	parseSettings(settingsData) {
		for (const sel in settingsData) {
			let selector = findSelector(sel);
			let data = settingsData[sel];
			if (selector) {
				switch (selector.handle) {
					case 'players':
						const playerRef = this.convertCommaDelimiter(data);
						this.data.players = playerRef.list;
						this.data.slots = playerRef.obj;
						this.addNamesArray(playerRef.list);
						this.addAlias(playerRef.obj);
						this.convertPlayerNicknames(playerRef.list);
						break;
					case 'slots':
						const slotRef = this.convertCommaDelimiter(data);
						this.data.slots = slotRef.obj;
						this.addNamesArray(slotRef.list);
						this.addAlias(slotRef.obj);
						break;
					case 'alias':
						const aliasRef = this.convertCommaDelimiter(data);
						this.addAlias(aliasRef.obj);
						this.addNamesArray(aliasRef.list);
						break;
					case 'moderators':
						const moderatorRef = this.convertCommaDelimiter(data);
						this.data.moderators = moderatorRef.list;
						break;
					case 'dead':
						const deadRef = this.convertCommaDelimiter(data);
						this.data.dead = deadRef.list;
						break;
					case 'days':
						const dayRef = this.convertCommaDelimiter(data);
						this.data.days = dayRef.list;
						break;
					case 'deadline':
						this.data.deadline = data;
						break;
					case 'countdown':
						const prodRef = this.convertCommaDelimiter(data);
						let prodList = prodRef.list;
						this.data.prods = [];
						for (let i = 0; i < 4; i++) {
							if (!isNaN(parseInt(prodList[i]))) this.data.prods[i] = prodList[i];
							else this.data.prods[i] = 0;
						}
						break;
					case 'pageData':
						this.data.pageData = data;
						break;
					case 'correctionWeight':
						this.data.correctionWeight = data;
						break;
					case 'prods':
						const prodTimerRef = this.convertProds(data);
						break;
					case 'edash':
						const edashInt = parseInt(data);
						if (!isNaN(edashInt)) this.data.edash = edashInt;
						else this.data.edash = -1;
						break;
					case 'edashOnTop':
						const edashOnTopInt = parseInt(data);
						if (!isNaN(edashOnTopInt)) this.data.edashOnTop = edashOnTopInt;
						else this.data.edashOnTop = -1;
						break;
					default:
						console.log('Unknown Setting');
						break;
				}
			} else {
				console.log(`Settings found [${sel}] as an unknown selector.`);
			}
		}
		console.log('Settings', this.data);
	}

	addNamesArray(nameArray) {
		for (let name of nameArray) {
			if (!this.data.totalnames.includes(name)) this.data.totalnames.push(name);
		}
	}
	addAlias(obj) {
		this.data.alias = Object.assign(this.data.alias, obj);
	}
	addSetting(handle, setting) {
		switch (handle) {
			case 'playerList':
				this.addPlayers(setting);
				break;
			default:
				break;
		}
	}
	addPlayers(players) {
		let slots = players.split(',');
		for (let i = 0; i < slots.length; i++) {
			let slot = slots[i];
			let players = slot.split(':');
			for (let f = 1; f < players.length; f++) {
				let cur = players[f],
					root = players[0];
				this.slotList[cur] = root;
			}
		}
	}
	convertPlayerNicknames(data) {
		const nicknames = {};
		for (let i = 0; i < data.length; i++) {
			const root = data[i];
			const splitData = root.split('{');
			if (splitData.length > 1) {
				let nicks = splitData[1].split('}')[0].split('+');
				for (let j = 0; j < nicks.length; j++) {
					nicknames[nicks[j]] = splitData[0];
				}
			}
		}
		console.log(nicknames);
		return nicknames;
	}
	convertCommaDelimiter(data) {
		const author = [],
			group = {};
		let slotRef = data.split(seperator);
		for (let i = 0; i < slotRef.length; i++) {
			let indivPlayers = slotRef[i].split(block);
			for (let j = 0; j < indivPlayers.length; j++) {
				const currentPlayer = indivPlayers[0].trim();
				const playerReference = indivPlayers[j].trim();
				author.push(playerReference);
				group[playerReference] = currentPlayer;
			}
		}
		return { list: author, obj: group };
	}
	convertProds(data) {
		const prods = [0, 0, 0, 0];
		const split = data.split(',');
		const val = split.length > prods.length ? prods.length : split.length;
		for (let i = 0; i < val; i++) {
			let prod = split[i].trim();
			let int = parseInt(prod);
			if (!isNaN(int)) {
				prods[i] = int;
			}
		}
	}
}
class Vote {
	constructor(voteData, category) {
		this.category = category;
		this.author = voteData.author;
		this.pronoun = voteData.pronoun;
		this.number = parseInt(voteData.post.number);
		this.url = voteData.post.url;
		this.votes = voteData.votes;
		this.vote = {
			last: null,
			valid: null,
		};
	}
	isAfter(vote) {
		return this.number > vote.number;
	}
	getNewest(vote) {
		if (!vote) {
			return this;
		} else {
			return this.isAfter ? this : vote;
		}
	}
	clean(settings) {
		const totalnames = settings.totalnames,
			alias = settings.alias,
			voteArray = this.votes[this.category];
		let lastVote = undefined,
			finalVote = undefined;
		for (let i = voteArray.length; i >= 0; i -= 1) {
			const originalVote = voteArray[i];
			if (lastVote === undefined) lastVote = originalVote;
			if (finalVote === undefined) {
				if (originalVote || originalVote === null) {
					if (originalVote === null) {
						finalVote = null;
					} else {
						let correction = findBestMatch(originalVote, totalnames).bestMatch;
						if (correction.rating >= settings?.correctionWeight || 0.7) {
							let corrected = alias[correction.target];
							if (corrected) {
								finalVote = corrected;
								if (lastVote === originalVote) lastVote = finalVote;
							}
						}
					}
				}
			}
		}
		this.vote.last = lastVote;
		this.vote.valid = finalVote;
	}
	isValid(settings, post) {
		const isCurrent = this.number > parseInt(settings.days[settings.days.length - 1]);
		const isOld = post ? !(this.number <= post) : false;
		const isModerator = settings.moderators.includes(this.author) || settings.moderators.includes(this.rootUser(this.author, settings.totalnames));
		const isPlayer = settings.totalnames.includes(this.author);
		let isDead = false;
		for (let deadUsr of settings.dead) {
			let deadRoot = this.rootUser(deadUsr, settings.totalnames).target;
			let userRoot = this.rootUser(this.author, settings.totalnames).target;
			if (userRoot === deadRoot) isDead = true;
		}
		const validity = isCurrent && !isOld && !isDead && !isModerator && isPlayer;
		return validity;
	}

	isDead(deadPost, deadUser, post) {
		let postDied = deadPost[deadUser];
		return postDied >= post;
	}
	rootUser(user, totalnames) {
		return findBestMatch(user, totalnames).bestMatch;
	}
}

class VoteCount {
	constructor({ voteCount, settings, post }) {
		this.settings = defaultFunc(settings);
		this.voteCount = voteCount;
		this.post = post;
	}
	clean() {
		const isValid = this.settings.players.length >= 1;
		const voteData = {
			votes: {},
			wagons: {},
			orderedWagons: [],
			allPlayers: [],
			notVoting: [],
			majority: null,
		};
		if (isValid) {
			for (const category in this.voteCount) {
				if (!voteData.votes[category]) voteData.votes[category] = {};
				if (!voteData.wagons[category]) voteData.wagons[category] = {};
				let hammerOccured = false;
				voteData.allPlayers = this.getAlive();
				voteData.notVoting = this.getAlive();
				voteData.majority = Math.ceil(voteData.notVoting.length / 2);
				for (const author in this.voteCount[category]) {
					if (!hammerOccured) {
						let voteArray = this.voteCount[category][author];
						let lastVote = null;
						let validVote = null;
						for (let i = 0; i < voteArray.length; i++) {
							let vote = new Vote(voteArray[i], category);
							vote.clean(this.settings);
							if (vote.vote.valid !== undefined) {
								if (vote.vote.valid) {
									validVote = vote.getNewest(validVote);
								} else {
									validVote = null;
								}
							}
							lastVote = vote.getNewest(lastVote);
						}

						let valid = validVote?.isValid(this.settings, this.post);
						if (valid && !hammerOccured) {
							let authorIndex = voteData.notVoting.indexOf(validVote.author);
							voteData.notVoting.splice(authorIndex, 1);
							voteData.votes[category][author] = {
								last: lastVote,
								valid: validVote,
							};
							if (!voteData.wagons[category][validVote.vote.valid]) voteData.wagons[category][validVote.vote.valid] = [];

							let wagons = voteData.wagons[category][validVote.vote.valid];
							wagons.push(validVote);
							wagons = sortArraysBySize(wagons);
							voteData.wagons[category][validVote.vote.valid] = wagons;
						}
					}
				}
				for (const wagonHandle in voteData.wagons[category]) {
					let wagon = this.sortWagonByPostNumber(voteData.wagons[category][wagonHandle]);
					if (!voteData.orderedWagons[category]) voteData.orderedWagons[category] = [];
					if (!voteData.orderedWagons[category][wagon.length]) voteData.orderedWagons[category][wagon.length] = {};
					voteData.orderedWagons[category][wagon.length][wagonHandle] = wagon;
				}
				if (voteData.orderedWagons[category]) voteData.orderedWagons[category].reverse();
				console.log(voteData.orderedWagons);
			}
		}
		let returnVal = this.settings.players.length;
		console.log(voteData);
		return returnVal >= 1 ? voteData : null;
	}
	sortWagonByPostNumber(wagon) {
		let newArray = wagon;
		let length = newArray.length;
		for (let i = 0; i < length; i++) {
			for (let j = 0; j < length - i - 1; j++) {
				if (newArray[j].number > newArray[j + 1].number) {
					let tmp = newArray[j];
					newArray[j] = newArray[j + 1];
					newArray[j + 1] = tmp;
				}
			}
		}
		return newArray;
	}
	format(voteData) {
		const { wagons, notVoting, orderedWagons, majority } = voteData;
		const { edash, edashOnTop } = this.settings;
		let totalVC = '';
		for (const category in wagons) {
			let categoryVotes = '[area=VC]';
			const wagonArray = orderedWagons[category];
			if (wagonArray)
				for (let i = 0; i < wagonArray.length; i++) {
					for (const wagonHead in wagonArray[i]) {
						let vote = wagonArray[i][wagonHead];
						let voteStr = `[b]${wagonHead}[/b] (${vote.length}) -> `;
						for (let i = 0; i < vote.length; i++) {
							if (i > 0) voteStr += ', ';
							voteStr += `${vote[i].author}`;
						}
						let eDash = majority - vote.length;
						const showEdash = i <= edashOnTop - 1 || eDash <= edash;
						if (showEdash) voteStr += eDash <= 0 ? ' [ELIMINATED]' : ` [E-${eDash}]`;
						categoryVotes += `${voteStr}\n`;
					}
				}
			if (notVoting.length > 0) {
				categoryVotes += `\n[b]Not Voting[/b] (${notVoting.length}) -> `;
				for (let i = 0; i < notVoting.length; i++) {
					if (i > 0) categoryVotes += ', ';
					categoryVotes += `${notVoting[i]}`;
				}
			}
			categoryVotes += '\n';
			if (this.getAlive() && majority) categoryVotes += `With ${this.getAlive().length} players alive it takes ${majority} to hammer\n`;
			categoryVotes += `${this.settings.deadline ? `Day ends in [countdown]${this.settings.deadline}[/countdown]` : ''}\n`;
			categoryVotes += `[/area]`;
			totalVC += categoryVotes;
		}
		return totalVC;
	}
	getAlive() {
		const { players, dead, deadPost } = this.settings;
		let aliveList = [];
		for (let i = 0; i < players.length; i++) {
			let root = this.getRootAuthor(players[i]);
			if (!containsObject(root, aliveList) && !containsObject(root, dead)) {
				aliveList.push(root);
			}
		}
		return aliveList;
	}
	checkValid(votePost, category) {
		const isCurrent = votePost.number > parseInt(this.settings.days[this.settings.days.length - 1]);
		const isOld = this.post ? !(votePost.number <= this.post) : false;
		const isModerator = this.settings.moderators.includes(votePost.author);
		let isDead = false;
		for (let deadUsr of this.settings.dead) {
			let deadRoot = this.rootUser(deadUsr);
			let userRoot = this.rootUser(votePost.author);
			if (deadRoot.target === userRoot.target) {
				isDead = true;
			}
		}
		return isCurrent && !isOld && !isDead && !isModerator;
	}
	isValidVote(vote) {
		let valid = false;
		if (vote) {
			let cor = this.rootUser(vote);
			if (cor.rating >= this.settings.correctionWeight || 0.7) {
				let correctedVote = this.settings.alias[cor.target];
				if (correctedVote) {
					valid = true;
				}
			}
		}
		return valid;
	}
	rootUser(user) {
		return findBestMatch(user, this.settings.totalnames).bestMatch;
	}
	getRootAuthor(author) {
		let bestMatch = findBestMatch(author, this.settings.totalnames).bestMatch;
		let root = this.settings.alias[bestMatch.target];
		return root || bestMatch.target;
	}
}
function containsObject(obj, list) {
	for (let i = 0; i < list.length; i++) {
		if (list[i] === obj) return true;
	}
	return false;
}
function sortArraysBySize(array) {
	for (let i = 1; i < array.lemgth; i++) {
		for (let j = i - 1; j > -1; j--) {
			let a = array[i].length,
				b = array[j].length;
			if (a < b) [array[j + 1], array[j]] = [array[j], array[j + 1]];
		}
	}
	return array;
}
