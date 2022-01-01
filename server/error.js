module.exports.get = get;

let errors = new Map([
	[400, 'Bad Request'],
	[401, 'Unauthorized'],
	[403, 'Forbidden'],
	[404, 'Not Found'],
	[405, 'Method Not Allowed'],
	[406, 'Not Acceptable'],
	[407, 'Proxy Authentication Required'],
	[408, 'Request Timeout'],
	[409, 'Conflict'],
	[410, 'Gone'],
	[411, 'Length Required'],
	[412, 'Precondition Failed'],
	[413, 'Payload Too Large'],
	[414, 'URI Too Long'],
	[415, 'Unsupported Media Type'],
	[416, 'Range Not Satisfiable'],
	[417, 'Expectation Failed'],
	[418, 'I\'m a teapot'],
	[426, 'Upgrade Required'],
	[428, 'Precondition Required'],
	[429, 'Too Many Requests'],
	[431, 'Request Header Fields Too Large'],
	[451, 'Unavailable For Legal Reasons'],
	[500, 'Internal Server Error'],
	[501, 'Not Implemented'],
	[502, 'Bad Gateway'],
	[503, 'Service Unavailable'],
	[504, 'Gateway Timeout'],
	[505, 'HTTP Verson Not Supported'],
	[506, 'Varaint Also Negotiates'],
	[510, 'Not Extended'],
	[511, 'Network Authentication Required']
]);

function get(code) {
	return errors.get(code);
}
