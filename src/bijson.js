var Bijson = function () {
    var rules;
    var endedCallback;
    var lex;
    var terminalSymbols, nonTerminalSymbols;
    var startSymbol;
    var tableGenerator = LR0;
    var table;
    
    //Lazy set polyfill
    if (typeof Set != "function") {
        Set = function () {
            var hashTable = {};
            return {
                add: function (x) {
                    hashTable[x] = true;
                },
                has: function (x) {
                    return hashTable[x] == true;
                },
                forEach: function (cb) {
                    for (var k in hashTable) {
                        cb(k);
                    }
                },
            }
        }
    }
    
    //Even lazier set polyfill
    if (typeof Symbol != "function") {
        Symbol = function (x) {
            return " / / / / @#$%" + x + "ñç&· \ \ \ \ ";//Until ES6 Symbols are widely supported, lets hope nobody tries THAT string
        }
    }

    var eos = Symbol('EndOfString');
    var axiom = Symbol('axiom');

    function printRule(r) {
        return r.l + " => " + r.r.join("");
    }
    function printCursor(c) {
        return printRule(c.getRule()) + " , " + c.getCursor();
    }
    function printAction(a) {
        switch (a.action) {
            case "shift":
                return "[shift:" + a.state + "] ";
                break;
            case "reduce":
                return "[reduce:" + printRule(a.rule) + "] ";
                break;
            case "accept":
                return "[accept] ";
                break;
        }
    }

    //Cursor= rule+position
    function Cursor(rule, n) {
        return {
            getRule: function () {
                return rule;
            },
            getCursor: function () {
                return n;
            },
            getLength: function () {
                return rule.r.length;
            },
            getNext: function () {
                return rule.r[n];
            },
            shift: function () {
                return Cursor(rule, n + 1);
            }
        };
    };

    var ID = (function () {
        var id = 0;
        return {
            reset: function () {
                id = 0;
            },
            next: function () {
                return id++;
            }
        }
    })();

    var state_table;
    var states = [];
    var visited;
    function registerCursor(cursor, id) {
        state_table[printCursor(cursor)] = id;
    }
    function searchCursor(cursor) {
        return state_table[printCursor(cursor)];
    }

    function State() {
        function expand(cursor) {
            var next = cursor.getNext();
            var usefulRules = rules.filter(function (x) { return x.l == next });
            var expandedRules = [];
            usefulRules.forEach(function (x) {
                var cursor = Cursor(x, 0);
                expandedRules.push(cursor);
                expandedRules = expandedRules.concat(expand(cursor));
            });
            return expandedRules;
        }
        var thisRules = [];
        var shift = {};
        var id = ID.next();
        var thisState = {
            print: function () {
                var s = id + ":[";
                thisRules.forEach(function (x) {
                    s += "{" + printRule(x.getRule()) + " , " + x.getCursor() + "}";
                });
                s += "]:[";
                for (var k in shift) {
                    s += "{ '" + k + "' --> " + shift[k].getId() + "}";
                }
                s += "]";
                return s;
            },
            getId: function () {
                return id;
            },
            addRule: function (rule) {
                var cursor = Cursor(rule, 0);
                thisRules.push(cursor);
                registerCursor(cursor, id);
                return cursor;
            },
            addCursor: function (cursor) {
                registerCursor(cursor, id);
                thisRules.push(cursor);
            },
            closure: function () {
                var nR = []
                thisRules.forEach(function (x) {
                    nR = nR.concat(expand(x));
                });
                thisRules = thisRules.concat(nR);
            },
            expand: function () {
                thisRules.forEach(function (x) {
                    if (x.getCursor() < x.getLength()) {
                        if (shift[x.getNext()] == undefined) {
                            var state = searchCursor(x.shift());
                            if (typeof state === "undefined") {
                                shift[x.getNext()] = State();
                            } else {
                                shift[x.getNext()] = states[state];
                            }
                        }
                        shift[x.getNext()].addCursor(x.shift());
                    }
                });
                for (var k in shift) {
                    shift[k].closure();
                    shift[k].expand();
                }
            },
            writeTable: function () {
                if (visited[id]) {
                    return;
                }
                visited[id] = true;
                table[id] = {};
                for (var k in shift) {
                    table[id][k] = { action: "shift", state: shift[k].getId() };
                }
                thisRules.forEach(function (x) {
                    if (x.getCursor() == x.getLength()) {
                        terminalSymbols.forEach(function (k) {
                            table[id][k] = { action: "reduce", rule: x.getRule()  };
                        });
                    }
                });
                for (var k in shift) {
                    shift[k].writeTable();
                }
            },
            isEOS: function () {
                table[id][eos] = { action: "accept"};
            }
        };
        states[id] = thisState;
        return thisState;
    };

    function LR0() {
        state_table = {};
        ID.reset();
        var initialState = State();
        rules.filter(function (x) { return x.l == axiom; }).forEach(function (x) {
            initialState.addRule(x);
        });
        initialState.closure();
        initialState.expand();
        table = [];
        visited = {};
        initialState.writeTable();
        rules.filter(function (x) { return x.l == axiom; }).forEach(function (x) {
            var acceptCursor = Cursor(x, x.r.length);
            var id = searchCursor(acceptCursor);
            console.log(printCursor(acceptCursor),">>>>>>>>>>>>>>>>>",id);
            if (id) {
                states[id].isEOS();
            }
        });
    }

    return {
        setGrammar: function (grammar) {
            startSymbol = grammar[0].l;
            grammar.unshift({ l: axiom, r: [startSymbol] });
            rules = grammar;
            nonTerminalSymbols = new Set();
            for (var i = 0; i < grammar.length; i++) {
                nonTerminalSymbols.add(grammar[i].l);
            }
            terminalSymbols = new Set();
            for (i = 0; i < grammar.length; i++) {
                for (var j = 0; j < grammar[i].r.length; j++) {
                    if (!nonTerminalSymbols.has(grammar[i].r[j])) {
                        terminalSymbols.add(grammar[i].r[j]);
                    }
                }
            }
            terminalSymbols.add(eos);
            tableGenerator();
        },
        setLexer: function (lexer) {
            lex = lexer;
        },
        parse: function (text, callback) {
            console.log("States");
            for (var i = 0; i < states.length; i++) {
                console.log(states[i].print());
            }
            console.log("Table");
            for (var i = 0; i < table.length; i++) {
                var str = "";
                for (var k in table[i]) {
                    str += k + "->" + printAction(table[i][k]);
                }
                console.log(i, str);
            }
            endedCallback = callback;
            var stack = [0];
            function readToken(x) {
                console.log(x, stack);
                var nextAction = table[stack[stack.length - 1]][x];
                if (typeof nextAction === "undefined") {
                    //No valid action
                    callback(false);
                    lex.stop();
                    return;
                }
                switch (nextAction.action) {
                    case "shift":
                        stack.push(nextAction.state);
                        break;
                    case "reduce":
                        var n = nextAction.rule.r.length;
                        while (n-- > 0) {
                            stack.pop();
                        }
                        console.log("reduce <=", nextAction.rule.l);
                        readToken(nextAction.rule.l);
                        console.log("consume again <=", x);
                        readToken(x);
                        break;
                    case "accept":
                        callback(true);
                        break;
                }
                console.log(x, stack);
            }
            console.log("Begin reading");
            lex.scan(text, readToken, function (x) {
                readToken(eos);
            });
        },
        lambda: Symbol('lambda')
    };
}