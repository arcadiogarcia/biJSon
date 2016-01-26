describe("bijson", function () {
    it("can implement basic parsing", function () {
        var lexer = Flejs();
        lexer.setTokens([
            { token: "1", action: function () { return "1" } },
            { token: "0", action: function () { return "0" } },
            { token: "a", action: function () { return "a" } },
            { token: "b", action: function () { return "b" } },
        ]);
        var parser = Bijson();
        parser.setGrammar([
            {l:"S",r:["N","L"]},
            {l:"N",r:["1"]},
            {l:"N",r:["0"]},
            {l:"L",r:["a"]},
            {l:"L",r:["b"]},
        ]);
        parser.setLexer(lexer);
        parser.parse("1b",function(x){
            expect(x).toBe(true);
        });
        parser.parse("0a",function(x){
            expect(x).toBe(true);
        });
        parser.parse("0ab",function(x){
            expect(x).toBe(false);
        });
        parser.parse("ab",function(x){
            expect(x).toBe(false);
        });
        parser.parse("",function(x){
            expect(x).toBe(false);
        });
        parser.parse("00a",function(x){
            expect(x).toBe(false);
        });
    });
    // it("can implement more advanced parsing", function () {
    //     var lexer = Flejs();
    //     lexer.setTokens([
    //         { token: "(", action: function () { return "(" } },
    //         { token: ")", action: function () { return ")" } },
    //     ]);
    //     var parser = Bijson();
    //     parser.setGrammar([
    //         {l:"S",r:[parser.lambda]},
    //         {l:"S",r:["(","S",")"]},
    //         {l:"S",r:["S","S"]},
    //     ]);
    //     parser.setLexer(lexer);
    //     parser.parse("(())()",function(x){
    //         expect(x).toBe(true);
    //     });
    //     parser.parse("(()()",function(x){
    //         expect(x).toBe(false);
    //     });
    // });
});