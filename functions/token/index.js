const jwt = require("jsonwebtoken");
let responses = "djdjd"

function tokenCallback()  {
    function verifyToken({ authToken }) {
        const token = authToken.split(' ')
       
        try {
            responses = jwt.verify(token[1], process.env.ACCESS_TOKEN_SECRET, function (err, decoded) { 
                 if(err){
                    responses = "token has expired."
                  
                 } else {
                    responses = "dhdhdh"
                    
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