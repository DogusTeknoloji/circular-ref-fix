(function (root, factory) {
    if (typeof exports === "object") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory());
    } else {
        root.circularRefFix = factory();
    }
})(this, function () {

    function createRefs(obj) {
        var seen = [];

        function fix(o) {
            if (o instanceof Array) {
                return o.map(fix);
            }

            if (o instanceof Object && typeof o === 'object') {
                return fixObject(o);
            }

            return o;
        }

        function fixObject(o) {
            var existingId = seen.indexOf(o);
            if (existingId >= 0) return {
                $ref: existingId
            };

            var newObj = {
                $id: seen.length
            };
            seen.push(o);

            for (var p in o) {
                newObj[p] = fix(o[p]);
            }

            return newObj;
        }

        return fix(obj);
    }

    function restoreRefs(obj) {
        var refs = [];
        var fixers = [];

        function fix(o) {
            if (o instanceof Array) {
                return fixArray(o);
            }

            if (o instanceof Object && typeof o === 'object') {
                return fixObject(o);
            }

            return o;
        }

        function fixArray(a) {
            for (var i = 0; i < a.length; i++) {
                fixIndexer(a, i);
            }

            return a;
        }

        function fixObject(o) {
            for (var p in o) {
                if (p === '$id') {
                    refs[o.$id] = o;
                    delete o.$id;
                    continue;
                }

                fixIndexer(o, p);
            }

            return o;
        }

        function fixIndexer(o, i) {
            var val = o[i];

            if (val.$ref != null) {
                fixers.push(fixer(o, i, val.$ref));
            } else {
                o[i] = fix(val);
            }
        }

        function fixer(o, p, r) {
            return function () {
                o[p] = refs[r];
            }
        }

        fix(obj);

        for (var i = 0; i < fixers.length; i++) {
            fixers[i]();
        }

        return obj;
    }

    return {
        createRefs: createRefs,
        restoreRefs: restoreRefs
    };
});