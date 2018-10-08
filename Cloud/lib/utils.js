/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = function (errors) {
    var keys = Object.keys(errors);
    var errs = [];

    // if there is no validation error, just display a generic error
    if (!keys) {
        return ['Oops! There was an error'];
    }

    keys.forEach(function (key) {
        errs.push(errors[key].message);
    });

    return errs;
};

/**
 * Index of object within an array
 *
 * @param {Array} arr
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.indexof = function (arr, obj) {
    var index = -1; // not found initially
    var keys = Object.keys(obj);
    // filter the collection with the given criterias
    var result = arr.filter(function (doc, idx) {
        // keep a counter of matched key/value pairs
        var matched = 0;

        // loop over criteria
        for (var i = keys.length - 1; i >= 0; i--) {
            if (doc[keys[i]] === obj[keys[i]]) {
                matched++;

                // check if all the criterias are matched
                if (matched === keys.length) {
                    index = idx;
                    return idx;
                }
            }
        }
    });
    return index;
};

/**
 * Find object in an array of objects that matches a condition
 *
 * @param {Array} arr
 * @param {Object} obj
 * @param {Function} cb - optional
 * @return {Object}
 * @api public
 */

exports.findByParam = function (arr, obj, cb) {
    var index = exports.indexof(arr, obj);
    if (~index && typeof cb === 'function') {
        return cb(undefined, arr[index]);
    } else if (~index && !cb) {
        return arr[index];
    } else if (!~index && typeof cb === 'function') {
        return cb('not found');
    }
    // else undefined is returned
};


/**
 * Remove duplicate values in an array and return the unique-value array
 *
 * @param {Array} arr
 * @api public
 */
exports.deduplicateArray = function(arr){
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];
    
    return arr.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
};


/**
 * check is a string / array / json object is empty
 *
 * @param {var} obj
 * @api public
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
exports.isEmpty = function(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};
