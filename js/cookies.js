function setCookie(key, value) {
	document.cookie = `${key}=${encodeURIComponent(value)}`;
}
function getCookie(name) {
	name = name + '=';
	var decodedCookie = decodeURIComponent(document.cookie);
	var cookies = decodedCookie.split(';');
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim();
		if (cookie.indexOf(name) == 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}
}
function deleteCookie(key) {
	document.cookie = key + ';max-age=0';
}
