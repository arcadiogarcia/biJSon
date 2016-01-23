describe("flejs", function () {
    it("can implement basic scanning", function () {
        var lexer = Flejs();
        lexer.setTokens([
            { token: "a", action: function () { return "A" } },
            { token: "b", action: function () { return "B" } },
            { token: "c", action: function () { return "C" } },
        ]);
        var result = "";
        lexer.scan("abccba", function (x) {
            result += x;
        }, function (x) {
            expect(x).toBe(true);
            expect(result).toBe("ABCCBA");
        });
    });
    
    it("can use regex and pass around values", function () {
        var lexer = Flejs();
        lexer.setTokens([
            { token: /([0-9])/, action: function (token,values) { values.number=parseInt(token);return "NUMBER" } },
            { token: /([A-Za-z]*)/, action: function (token,values) { values.text=token;return "TEXT" } },
        ]);
        var texts = "";
        var numbers = "";
        lexer.scan("abc8bc1", function (x,values) {
            if(x=="NUMBER"){
               numbers+=values.number;
            }
            if(x=="TEXT"){
               texts+=values.text;
            }
        }, function (x) {
            expect(x).toBe(true);
            expect(texts).toBe("abcbc");
            expect(numbers).toBe("81");
        });
    });
});