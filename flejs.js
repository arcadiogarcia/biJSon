var Flejs = function () {
    var tokens = [];
    return {
        setTokens: function (tokenArray) {
            tokens = tokenArray;
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i].token;
                var action = tokens[i].action;
                if (typeof token==="undefined"){
                     console.error("Rule #"+i+"does not have a token.");
                     tokens=[];
                     return;
                }
                if (!(token instanceof RegExp||typeof token =="string")){
                     console.error("Rule #"+i+" does not have a String or RegExp as token.");
                     tokens=[];
                     return;
                }
                if (typeof action!=="function"){
                     console.error("Rule #"+i+"does not have an action.");
                     tokens=[];
                     return;
                }
            }
        },
        scan: function (text, callback, end_callback) {
            var n=0;
            while (text.length > 0) {
                var flag=false;
                for (var i = 0; i < tokens.length; i++) {
                    var token = tokens[i].token;
                    var action = tokens[i].action;
                    if (text.search(token) == 0) {
                        var currentToken;
                        if (token instanceof RegExp) {
                            var result = token.exec(text);
                            if (result.length != 2) {
                                console.error("RegExp " + token.toString() + " must have one (and only one) capture group");
                            }
                            currentToken = result[1];
                        } else {
                            currentToken = token;
                        }
                        var values = {};
                        callback(action(currentToken, values), values);
                        n+=currentToken.length;
                        text=text.slice(currentToken.length);
                        flag=true;
                        break;
                    }
                }
                if(flag==false){
                    console.error("At position "+n+", no rules can be aplied!");
                    end_callback(false);
                    return;
                }
            }
            end_callback(true);
        }
    };
};