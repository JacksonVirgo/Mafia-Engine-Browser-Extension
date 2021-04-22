const socket = io('http://127.0.0.1:5000');

$(() => {
	$('.topic-actions').each((index, value) => {
		let button = generateButton();
		$(value).append(button);
	});
});

function generateButton() {
	let result = $('<button>');
	result.attr('type', 'button');
	result.text('Vote Count');
	result.click((e) => {
		socket.emit('votecount', { url: window.location.href });
		console.log(e);
	});
	return result;
}

socket.on('error', (data) => {
	console.log(data);
});
socket.on('progress', (data) => {
	console.log(data);
});
socket.on('result', (data) => {
	console.log(data);

	let votes = new VoteCount(data);
	const cleaned = votes.clean();
	if (cleaned) {
		const format = votes.format(cleaned);
		$('.inputbox').text(format);
		console.log(format);
	}
	console.log(data);
});
