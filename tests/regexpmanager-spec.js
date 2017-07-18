var WebApi = require("../"), api, bool, RegularsManager, optionTypes;

describe("TextProcessor", function () {
    
    beforeEach(function() {
        RegularsManager = WebApi.RegularsManager;
    });

    it("loaded", function() {
        expect(RegularsManager).toBeDefined();
    });
    
    it('common expressions should be defined', function() {
        expect(RegularsManager.space).toBeDefined();
        expect(RegularsManager.dot).toBeDefined();
        expect(RegularsManager.digits).toBeDefined();
    });
    
    it('regular type should be a function what recive text and return clone RegObj with current text', function() {
    
    });

    it('clone method should return regularObject with equal fields', function() {

    });

    it('getSring method should return preassigned text ', function() {

    });
    
    it('addFlags method should add flags to clone of RegObj', function() {

    });
    
    it('g and i methods should add flags', function() {

    });
    
    it('set method should wrap regular sourse [ ] square brackets', function() {

    });

    it('start method should add ^ to start of regular sourse', function() {

    });

    it('end method should add $ to end of regular sourse', function() {

    });

    it('split method should return array splited by current regExp', function() {

    });

    it('replace method should replace original text by current regexp and return ', function() {

    });

    it('replaceWrapped method should replace original text wrapped by wrapped symbol', function() {

    });

    it('replaceLeftWrapped method should replace text with wrapped symbol in left', function() {

    });

    it('replaceRightWrapped method should replace text with wrapped symbol in right', function() {

    });

    it('wrapInclude method should wrap match in text by wrap symbols', function() {

    });
    
    it('composition method should return combain RegObj from original and received', function() {

    });

    it('or method should return combain RegObj from original and received and separate it by |', function() {

    });

    it('compositionGraph method should return combain RegObj from original and array of received', function() {

    });
});
