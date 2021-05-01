const global = {
	voteCountProgress: 'Vote Counter Progress',
};
const cache = {};
const replacementUrl = 'https://forum.mafiascum.net/viewtopic.php?f=4&t=70776';

chrome.runtime.onMessage.addListener(receiveMessage);
function receiveMessage(req, sender, res) {
	console.log(req);
	if (req.type === 'replacement') {
		let data = req.data;
		$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
		$('textarea.inputbox').first().val(data);
	}
}
function sendMessageToBackground(type, data = null) {
	chrome.runtime.sendMessage({ type, data });
}

$(() => {
	if (isThread()) {
		let threadVC = generateButtonThreadVC();
		let pageNumber = $('.pagination').find('strong').first().html();
		$('#topic-search').append(threadVC);
		$('.post').each((index, value) => {
			let root = $(value);
			let postNumber = (pageNumber - 1) * 25 + index;
			let postTools = root.find('.profile-icons').first();
			let userTools = root.find('.profile-icons:last-child');
			let postprofile = root.find('dl.postprofile');
			let username = postprofile.first().find('dt').first().find('a').first().text();
			if (postTools) postTools.append(generateButtonPostVC(postNumber));
			if (userTools) {
				let dd = $('<dd>');
				dd.append(generateButtonReplacement(username));
				postprofile.append(dd);
			}
		});
		if (window.location.href === replacementUrl) sendMessageToBackground('requestReplacement');
	}
});
function isThread() {
	let params = new URLSearchParams(window.location.href);
	return params.get('t') || params.get('p');
}
const setPostVC = () => {
	let pageNumber = $('.pagination').find('strong').first().html();
	$('.post').each((index, value) => {
		//if ($(this).children('.inner').first().children('.postprofile').length === 0) return;

		let postNumber = (pageNumber - 1) * 25 + i;
		console.log(postNumber);
		let authorPanel = $(value).find('.author');
		let firstAnchor = authorPanel.find('a').first();
		if (firstAnchor) {
			let postVC = generateButtonPostVC(postNumber);
			let icons = $(value).find('.profile-icons').first();
			icons.append(postVC);
		}
	});
};
const sendReplacement = (windowRef, replacementUsername) => {
	sendMessageToBackground('replacementUsername', replacementUsername);
	socket.emit('replacement', { url: windowRef, user: replacementUsername });
	$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
	$('#editor').find('h2').first().text('Generating Replacement Post...');
};
function sendVoteCount(url, params = {}) {
	const { post, raw } = params;
	socket.emit('votecount', { url, post, raw });
	$('#editor').find('h2').first().text(generateProgressString('0%'));
	$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
}
const generateButtonThreadVC = () => {
	let result = $('<input>');
	result.attr('type', 'button');
	result.addClass('button2');
	result.val('Vote Count');
	result.click((e) => {
		sendVoteCount(window.location.href);
	});
	return result;
};
function generateButtonPostVC(postNumber) {
	let result = $('<input>');
	result.attr('type', 'button');
	result.attr('id', `vc_${postNumber}`);
	result.addClass('button2');
	result.val('VC From Post');
	result.click((e) => {
		sendVoteCount(window.location.href, { post: e.currentTarget.id.split('_')[1] });
	});
	return result;
}
function generateButtonReplacement(username) {
	let result = $('<input>');
	result.attr('type', 'button');
	result.addClass('button2');
	result.val('Replace User');
	result.click((e) => {
		sendReplacement(window.location.href, { user: username });
	});
	return result;
}

const generateProgressString = (progress) => {
	return `${global.voteCountProgress} - ${progress}`;
};
function setProgress(progress) {
	$('#editor').find('h2').first().text(progress);
}
function getCalendarDate() {
	let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	let date = new Date();
	let currentDay = date.getDate();
	currentDay = attachSuffixOf(currentDay);
	let currentMonth = date.getMonth() + 1;
	return `${currentDay} ${months[currentMonth - 1]}`;
}

socket.on('error', console.log);
socket.on('progress', (data) => {
	const { lastPage, currentPage } = data;
	if (currentPage && lastPage) {
		setProgress(generateProgressString(`${Math.round((currentPage / lastPage) * 100)}%`));
	}
});
socket.on('result', (data) => {
	console.log(data);
	setProgress(generateProgressString('Complete'));
	let vc = new VoteCount(data);
	let cleaned = vc.clean();
	if (cleaned) {
		const format = vc.format(cleaned);
		if (format) $('textarea.inputbox').first().val(format);
	}
});
socket.on('replacement', (data) => {
	sendMessageToBackground('replacement', data);
	window.location.href = replacementUrl;
});
socket.on('ping', console.log);
socket.on('connection_failed', (e) => console.log('Server Unavailable'));
