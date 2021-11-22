require('dotenv').config()
function get(req, type) {

    if (req.headers.cookie) {
        const rawCookies = req.headers.cookie.split('; ');
        const parsedCookies = {};
        rawCookies.forEach(rawCookie => {
            const parsedCookie = rawCookie.split('=');
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });
 
        if (parsedCookies[process.env.NAME_TOKEN_SECRET]) 
        {
            var str = parsedCookies[process.env.NAME_TOKEN_SECRET].split('%20');
            if (type == "getToken")
                return str[1]
            else if(type == "getUsername")
                return str[0]
            return str[2]
        }
        return null
    }
    else
        return null
}

module.exports = { get }
