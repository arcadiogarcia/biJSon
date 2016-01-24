var Bijson = function () {
    var rules;
    var endedCallback;
    var lex;
    var terminalSymbols, nonTerminalSymbols;
    var startSymbol;
    var tableGenerator = LR0;
    var table;

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
                Cursor(rule, n + 1);
            },
        };
    };

    var ID=(function(){
        var id=0;
        return {
            reset:function(){
                id=0;
            },
            next:function(){
                return id++;
            }
        }
    })();

    function State() {
        function expand(cursor) {
            var next = cursor.getNext;
            var usefulRules = rules.filter(function (x) { return x.l == next });
            var expandedRules = [];
            usefulRules.forEach(function (x) {
                var cursor = Cursor(x, 0);
                expandedRules.push(cursor);
                expandedRules.concat(expand(cursor));
            });
            return expandedRules;
        }
        var thisRules = [];
        var shift = {};
        var rules;
        var id=ID.next();
        return {
            getId:function(){
                return id;
            },
            addRule: function (rule) {
                var cursor = Cursor(rule, 0);
                thisRules.push(cursor);
                return cursor;
            },
            addCursor: function (cursor) {
                thisRules.push(cursor);
            },
            closure: function (cursor) {
                thisRules.forEach(function (x) {
                    thisRules.concat(expand(x));
                });
            },
            expand: function () {
                thisRules.forEach(function (x) {
                    if (x.getCursor() < x.getLength()) {
                        if (shift[x.getNext()] == undefined) {
                            shift[x.getNext()] = State();
                        }
                        shift[x.getNext()].addCursor(x.shift);
                    }
                });
                for (var k in shift) {
                    shift[k].closure();
                    shift[k].expand();
                }
            },
            writeTable: function () {
                table[id]={};
                for (var k in shift) {
                    table[id][k]={action:"shift",state:shift[k].getId()};
                }
                thisRules.forEach(function (x) {
                    table[id][k]={action:"reduce", rule: x.getRule()};
                });
                for (var k in shift) {
                    shift[k].writeTable();
                }
            }
        };
    };

    function LR0() {
        ID.reset();
        var initialState = State();
        rules.filter(function (x) { return x.l == startSymbol; }).forEach(function (x) {
            initialState.addRule(x);
        });
        initialState.closure();
        initialState.expand();
        initialState.writeTable();
    }

    return {
        setGrammar: function (grammar) {
            rules = grammar;
            nonTerminalSymbols = new Set();
            for (var i = 0; i < grammar.length; i++) {
                nonTerminalSymbols.add(grammar[i].l);
            }
            terminalSymbols = new Set();
            for (i = 0; i < grammar.length; i++) {
                for (var j = 0; j < grammar[i].r.length; j++) {
                    if (nonTerminalSymbols.has(grammar[i].r[j])) {
                        terminalSymbols.add(grammar[i].r[j]);
                    }
                }
            }
            startSymbol = grammar[0].l;
            tableGenerator();
        },
        setLexer: function (lexer) {
            lex = lexer;
        },
        parse: function (text, callback) {
            endedCallback = callback;
        },
        lambda: null
    };
}