var WebApi,
 api, bool, RegularsManager, optionTypes,
    regSpace;

    // global.describe = function(t, r) {r()};
    // global.beforeEach = function(r){r()};
    // global.it = function(n, r){r()};
    // global.expect = function(){
    //     return {
    //         toBeDefined: function(){},
    //         toEqual:function(){}
    //     }
    // };
describe("RegularsManager", function () {

    beforeEach(function() {
        WebApi = (typeof window === 'undefined') ? require("../") : WEBSPELLCHECKER;

        RegularsManager = WebApi.RegularsManager;
        regSpace = RegularsManager.space.init('text');
    });

    it("loaded", function() {
        expect(RegularsManager).toBeDefined();
    });

    it('common expressions should be defined', function() {
        expect(RegularsManager.space).toBeDefined();
        expect(RegularsManager.dot).toBeDefined();
        expect(RegularsManager.digits).toBeDefined();
    });

    it('regular type should be a object init should return clone RegObj with current text', function() {
        expect(typeof RegularsManager.space).toEqual('object');
        regSpace = RegularsManager.space.init('list');
        expect(typeof regSpace).toEqual('object');
        expect(RegularsManager.space === regSpace).toEqual(false);
    });

    it('clone method should return regularObject with equal fields', function() {
        var regSpaceClone = regSpace.clone();
        for (var k in regSpace) {
            expect(regSpace[k]).toEqual(regSpaceClone[k]);
        }
    });

    it('getString method should return preassigned text ', function() {
        var text = "standard text";
        expect( RegularsManager.space.init(text).getString() )
            .toEqual( text );
    });

    it('addFlags method should add flags to clone of RegObj', function() {
        expect(regSpace.flags).toEqual('');
        regSpace = regSpace.addFlags('gi');
        expect(regSpace.flags).toEqual('gi');
        regSpace = regSpace.addFlags('ig');
        expect(regSpace.flags).toEqual('gi');
    });

    it('g and i methods should add flags', function() {
        expect(regSpace.flags).toEqual('');
        var _regSpace = regSpace.g().g();
        expect(_regSpace.flags).toEqual('g');
        _regSpace = _regSpace.i().i();
        expect(_regSpace.flags).toEqual('gi');
        expect(regSpace.i().i().flags).toEqual('i');
    });

    it('set method should wrap regular source [ ] square brackets', function() {
        var source = regSpace.source;
        regSpace = regSpace.set().set();
        expect(regSpace.source).toEqual(source);
        var regDot = RegularsManager.dot.init('text');
        source = regDot.source;
        regDot = regDot.set().set();
        expect(regDot.source).toEqual('[' + source + ']');
    });

    it('group method should wrap regular source ( ) round brackets', function() {
        var source = regSpace.source;
        regSpace = regSpace.group();
        expect(regSpace.source).toEqual('(' + source + ')');
    });

    it('start method should add ^ to start of regular source', function() {
        var source = regSpace.source;
        regSpace = regSpace.start();
        expect(regSpace.source).toEqual('^' + source);
    });

    it('end method should add $ to end of regular source', function() {
        var source = regSpace.source;
        regSpace = regSpace.end();
        expect(regSpace.source).toEqual(source + '$');
    });

    it('split method should return array splited by current regExp', function() {
        var resArr = RegularsManager.space.init('test tesst retest').split();
        expect(resArr.length).toEqual(3);
        expect(resArr[0], resArr[1], resArr[2]).toEqual('test', 'tesst', 'retest');
    });

    it('replace method should replace original text by current regexp and return ', function() {
        var text = RegularsManager.space.init('test tesst retest').replace('').getString();
        expect(text).toEqual('testtesst retest');
        text = RegularsManager.space.init('test tesst retest').g().replace('').getString();
        expect(text).toEqual('testtesstretest');
    });

    it('replaceLeftWrapped method should replace text with wrapped symbol in left', function() {
        var text = RegularsManager.space.init('test# retest')
            .replaceLeftWrapped('#', '<')
            .getString();
        expect(text).toEqual('test<retest');
    });

    it('replaceRightWrapped method should replace text with wrapped symbol in right', function() {
        var text = RegularsManager.space.init('test #retest')
            .replaceRightWrapped('#', '>')
            .getString();
        expect(text).toEqual('test>retest');
    });

    it('wrapInclude method should wrap match in text by wrap symbols', function() {
        var text = RegularsManager.space
            .init('test retest')
            .wrapInclude('#')
            .getString();

        expect(text).toEqual('test# #retest');
    });

    it('wrapInclude method should work with replaceWrapped methods', function() {
        var _situationalSepSetGlob = RegularsManager.situationalSeparators
            .set().g();

        var text = "test1...data1 test2---data2 test3''data3";
        text = _situationalSepSetGlob
            .composition(RegularsManager.twoAndMore)
            .init(text)
            .wrapInclude("#")
            .getString();

        text = _situationalSepSetGlob
            .init(text)
            .replaceLeftWrapped('#', ' ')
            .replaceRightWrapped('#', ' ')
            .getString();

        expect(text).toEqual('test1 . data1 test2 - data2 test3  data3');
    });

    it('composition method should return combain RegObj from original and received', function() {
         var spaceAndDots = RegularsManager.space
                .init('T .r. r')
                .composition( RegularsManager.dot )
                .g(),
            spaceAndDotsSet = spaceAndDots.set();

        var text = spaceAndDots.replace('').getString();
        expect(text).toEqual('Tr. r');
        text = spaceAndDotsSet.replace('').getString();
        expect(text).toEqual('Trr');

        expect(spaceAndDotsSet.source).toEqual('[\\s\\xA0\\.]');
    });

    it('or method should return combain RegObj from original and received and separate it by |', function() {
        var situationalSeparatorsSet = RegularsManager.situationalSeparators.set();
        var text = RegularsManager.space
            .composition( situationalSeparatorsSet )
            .group()
            .or(
                situationalSeparatorsSet
                    .composition( RegularsManager.space )
                    .group()
            ).g()
            .init('test-test -res- test- ')
            .replace('  ')
            .getString();
        expect(text).toEqual('test-test  res  test  ');
    });

    it('compositionGraph method should return combain RegObj from original and array of received', function() {
        var punctuation = RegularsManager.space.compositionGraph([
            RegularsManager.dot,
            RegularsManager.EOL,
            RegularsManager.digits
        ]).g();

        var text = punctuation.replace('test .\r2test .2. ', '');
        expect(text).toEqual('testtest .2. ');
    });
});
