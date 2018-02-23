require('mocha');
var assert = require('chai').assert;
var circularFix = require('../index');
var createRefs = circularFix.createRefs;
var restoreRefs = circularFix.restoreRefs;

describe('createRefs function', function () {
    var couple = getCouple();
    var fixedCouple = createRefs(couple);
    console.log(JSON.stringify(fixedCouple));

    it('should replace recurring instances with refs', function (done) {
        assert.equal(2, fixedCouple.length);

        var mother = fixedCouple[0];
        assert.equal('Marge', mother.name);

        var father = mother.spouse;
        assert.equal('Homer', father.name);

        var fatherRef = fixedCouple[1];
        assert.equal(father.$id, fatherRef.$ref);

        done();
    });
});

describe('restoreRefs function', function () {
    var couple = getCouple();
    var fixedCouple = getFixedCouple();
    
    it('should replace refs with original objects', function (done) {
        var restoredCouple = restoreRefs(fixedCouple);
        assert.deepEqual(couple, restoredCouple);

        done();
    });
})

function getCouple() {
    var child1 = {
        name: 'Bart'
    };
    var child2 = {
        name: 'Lisa'
    };
    var mother = {
        name: 'Marge'
    };
    var father = {
        name: 'Homer'
    };

    child1.siblings = [child2];
    child1.mother = mother;
    child1.father = father;

    child2.siblings = [child1];
    child2.mother = mother;
    child2.father = father;

    mother.spouse = father;
    mother.children = [child1, child2];

    father.spouse = mother;
    father.children = [child1, child2];

    return [mother, father];
}

function getFixedCouple() {
    return [{
        "$id": 0,
        "name": "Marge",
        "spouse": {
            "$id": 1,
            "name": "Homer",
            "spouse": {
                "$ref": 0
            },
            "children": [{
                "$id": 2,
                "name": "Bart",
                "siblings": [{
                    "$id": 3,
                    "name": "Lisa",
                    "siblings": [{
                        "$ref": 2
                    }],
                    "mother": {
                        "$ref": 0
                    },
                    "father": {
                        "$ref": 1
                    }
                }],
                "mother": {
                    "$ref": 0
                },
                "father": {
                    "$ref": 1
                }
            }, {
                "$ref": 3
            }]
        },
        "children": [{
            "$ref": 2
        }, {
            "$ref": 3
        }]
    }, {
        "$ref": 1
    }];
}