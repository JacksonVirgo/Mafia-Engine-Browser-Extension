const socket = io('https://stage.mafiaengine.com');
function sendVoteCount(url, params = {}) {
	const { post, raw } = params;
	socket.emit('votecount', { url, post, raw });
	$('#editor').find('h2').first().text(generateProgressString('0%'));
	$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
}
function sendReplacement(url, params = {}) {
	const user = params.user ? params.user : null;
	socket.emit('replacement', { url, user });
	$([document.documentElement, document.body]).animate({ scrollTop: $('#editor').offset().top }, 1000);
	$('#editor').find('h2').first().text('GENERATE REPLACEMENT POST');
	setCookie('replacementUsername', user);
}
