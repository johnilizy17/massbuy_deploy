const jwt = require("jsonwebtoken");
let responses 

function tokenCallback()  {
    const verifyToken=({ authToken }) => {
        const token = authToken.split(' ')    
        try {
            jwt.verify(token[1], process.env.ACCESS_TOKEN_SECRET, function (err, decoded) { 
                 if(err){
                    responses = {data:"token has expired.", status:500}
                  
                 } else {
                    responses = {data: decoded, status:500}
                }

            });
        } catch (e) {
            responses = {data:"Invalid token detected.", status: 500}
           
        }
        return responses
    };
    return { verifyToken }
}

module.exports = { tokenCallback }