var Flejs = function () {
    var tokens = [];
    //From http://stackoverflow.com/questions/494035/how-do-you-pass-a-variable-to-a-regular-expression-javascript/494122#494122
    RegExp.quote = function(str) {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    };
    var stop=true;
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
                if (typeof token == "string"){
                     tokens[i].token=RegExp.quote(token);
                }
            }
        },
        scan: function (text, callback, end_callback) {
            stop=false;
            var n=0;
            while (text.length > 0) {
                if(stop==true){
                    return;
                }
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
        },
        stop:function(){
            stop=true;
        }
    };
};