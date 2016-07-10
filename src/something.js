const merge = require('merge');


//TODO extract criteria, modifier,... in requests
//TODO manage subroute/subdocument


//require body-parser

//Must extract first route segmentation after /api/
//extract ID if available
//extract find criteria if available


/*
 * {
 *   criteria : {
 *       collection   : "",
 *       collectionId : "",
 *       fields         : "",
 *       filters       : ""
 *    },
 *   request : {
 *       fields : "",
 *       condition : {},
 *       data      : {}
 *   }
 * }
 * */


var defaultOptions = {
    keyId : '_id',
    driver : 'mongoose',
    mongooseInstance : null
};

module.exports = function(options){
    options = merge({},defaultOptions,options || {});
    return function(req) {
        var criteria = _getCriteria(req.path),
            request  = _getBodyData(criteria,req.body,options);
        return {
            criteria : criteria,
            request  : request
        };
    };
};

const ROUTE_PATTERN = {
    COLLECTION    : 0,
    COLLECTION_ID : 1,
    FIELDS        : 2,
    FILTERS       : 3
};

function _getCriteria(path){
    var route = path.split('/').slice(1),
        pathCount = route.length,
        criteria = {
            collection   : route[ROUTE_PATTERN.COLLECTION].capitalize(),
            collectionId : (pathCount >= 2) ? route[ROUTE_PATTERN.COLLECTION_ID]      : "",
            fields       : (pathCount >= 3) ? route[ROUTE_PATTERN.FIELDS].split(',')  : [],
            filters      : (pathCount >= 4) ? route[ROUTE_PATTERN.FILTERS].split(',') : []
        };
    return criteria;
}

function _getBodyData(criteria, body,options){
    var driver = require('./something-'+options.driver + '.js')['_'+options.driver+'QueryParameters'];
    if(driver && typeof(driver) === 'function'){
        switch(options.driver){
            case 'mongoose':
                return __mongoose(driver,criteria, body,options.mongooseInstance,options);
                break;
            default:
                throw new Error("No driver " + options.driver + " found");

        }
    } else {
        throw new Error("No driver " + options.driver + " found");
    }
}

function __mongoose(driver,criteria,body,mongoose,options){
    if(mongoose != null){
        try{
            return driver(criteria, body,mongoose,options);
        } catch(error) {
            throw new Error(error);
        }
    } else {
        throw new Error("MongooseInstance is null");
    }
}