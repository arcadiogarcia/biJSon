describe("bijson", function () {
    it("can implement basic parsing", function () {
        var lexer = Flejs();
        lexer.setTokens([
            { token: "(", action: function () { return "(" } },
            { token: ")", action: function () { return ")" } },
        ]);
        var parser = Bijson();
        parser.setGrammar([
            {l:"S",r:[parser.lambda]},
            {l:"S",r:["(","S",")"]},
            {l:"S",r:["S","S"]},
        ]);
        parser.setLexer(lexer);
        parser.parse("(())()",function(x){
            expect(x).toBe(true);
        });
    });
});