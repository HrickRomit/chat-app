const { verifyAccessToken } = require('../config/jwt');

function authRequired(req, res, next) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : (req.cookies?.accessToken || null);
		if (!token) return res.status(401).json({ msg: 'Unauthorized' });
		const decoded = verifyAccessToken(token);
		req.user = { id: decoded.id };
		return next();
	} catch (err) {
		return res.status(401).json({ msg: 'Unauthorized' });
	}
}

module.exports = { authRequired };
