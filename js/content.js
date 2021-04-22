const socket = io('https://stage.mafiaengine.com');
const global = {
	voteCountProgress: 'Vote Counter Progress',
};
const cache = {};
const replacementUrl = 'https://forum.mafiascum.net/viewtopic.php?f=4&t=70776';

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
		if (window.location.href === replacementUrl) {
			let data = getCookie('replacementData');
			if (data) {
				$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
				$('textarea.inputbox').first().val(data);
				deleteCookie('replacementData');
			}
		}
	}
});
function isThread() {
	let url = window.location.href;
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
const setReplacement = () => {};
const generateButtonThreadVC = () => {
	let result = $('<input>');
	result.attr('type', 'button');
	result.addClass('button2');
	result.val('Vote Count');
	result.click((e) => {
		requestVoteCount();
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
		let id = e.currentTarget.id.split('_')[1];
		console.log(id);
		requestVoteCount({ post: id });
	});
	return result;
}
function generateButtonReplacement(username) {
	let result = $('<input>');
	result.attr('type', 'button');
	result.addClass('button2');
	result.val('Replace User');
	result.click((e) => {
		generateReplacement(username);
	});
	return result;
}
function requestVoteCount(data = {}) {
	const { post } = data;
	$('#editor').find('h2').first().text(generateProgressString('0%'));
	socket.emit('votecount', { url: window.location.href, post: post ? post : null });
	$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
}
function generateReplacement(user) {
	$('#editor').find('h2').first().text(generateProgressString('PENDING'));
	socket.emit('replacement', { url: window.location.href, user });
	setCookie('replacementUsername', user);
	$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
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
function attachSuffixOf(i) {
	let j = i % 10,
		k = i % 100;
	if (j === 1 && j !== 11) return i + 'st';
	else if (j === 2 && k !== 12) return i + 'nd';
	else if (j === 3 && k !== 13) return i + 'rd';
	else return i + 'th';
}

socket.on('error', console.log);
socket.on('progress', (data) => {
	const { lastPage, currentPage } = data;
	if (currentPage && lastPage) {
		setProgress(generateProgressString(`${Math.round((currentPage / lastPage) * 100)}%`));
	}
});
socket.on('result', (data) => {
	setProgress(generateProgressString('Complete'));
	let vc = new VoteCount(data);
	let cleaned = vc.clean();
	if (cleaned) {
		const format = vc.format(cleaned);
		if (format) $('textarea.inputbox').first().val(format);
	}
});
socket.on('replacement', (data) => {
	const { author, lastPage, title, url } = data;
	let today = getCalendarDate();
	let username = getCookie('replacementUsername');
	deleteCookie('replacementUsername');
	let result = `${today}\n[i][url=${url}]${title}[/url][/i]\n[b]Moderator:[/b] [user]${author}[/user][tab]3[/tab][tab]3[/tab][b]Status:[/b] ${lastPage} pages [tab]3[/tab] [b]Replacing:[/b] [user]${username}[/user]`;
	setCookie('replacementData', result);
	window.location.href = replacementUrl;
});
socket.on('ping', console.log);
socket.on('connection_failed', (e) => console.log('Server Unavailable'));
