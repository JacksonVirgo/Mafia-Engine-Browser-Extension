console.log('Background Running');
const cache = {
	replacement: null,
	replacementUsername: null,
};
function sendMessageToContent(tab, content) {
	chrome.tabs.sendMessage(tab.id, content);
}
chrome.runtime.onMessage.addListener(onMessage);
function onMessage(req, sender, res) {
	console.log(req);
	switch (req.type) {
		case 'replacement':
			if (cache.replacementUsername) {
				const { author, lastPage, title, url } = req.data;
				let today = getCalendarDate();
				let result = `${today}\n[i][url=${url}]${title}[/url][/i]\n[b]Moderator:[/b] [user]${author}[/user][tab]3[/tab][tab]3[/tab][b]Status:[/b] ${lastPage} pages [tab]3[/tab] [b]Replacing:[/b] [user]${cache.replacementUsername}[/user]`;
				cache.replacement = result;
			} else console.log('Did Not Have Stored Username');

			break;
		case 'replacementUsername':
			const { user } = req.data;
			if (user) cache.replacementUsername = user;
			break;
		case 'requestReplacement':
			if (cache.replacement) sendMessageToContent(sender.tab, { type: 'replacement', data: cache.replacement });
			else sendMessageToContent(sender.tab, { message: 'Did not have replacement' });
			break;
	}
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
