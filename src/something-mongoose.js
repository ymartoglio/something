
var DBDriver = {};

module.exports = DBDriver;

DBDriver['_mongooseQueryParameters'] = function(criteria, body,mongoose,options){
    var request = {fields:"",condition:{},data:null}, bodyData,
        keyIdName = (options) ? options.keyId || '_id' : {};
    if(body){
        bodyData = (body.auth) ? body.data : body;
        request.data = bodyData;

        if(criteria.collectionId && criteria.collectionId !== 'search'){
            request.condition[keyIdName] = criteria.collectionId;
        }

        if(criteria.collection){
            var model = mongoose.model(criteria.collection);
            if(model){
                if(criteria.fields.length > 0){
                    request.fields = criteria.fields.join(' ');
                    if(Object.keys(request.data).length){
                        request.data = __mongooseFormatUpdateQuery(model,criteria.fields,request.data);
                    }
                }
                if(criteria.filters.length > 0){
                    request.condition = __mongooseFormatFindQuery(criteria.fields,criteria.filters);
                }
            }
        }
    }
    return request;
};


/*************************************
 READ
 ********/

function __mongooseFormatFindQuery(fields,filters){
    var key,value,condition = {},comparison;
    for(var index = 0 ; index < filters.length ; index++){
        key   = fields[index];
        value = filters[index];
        if(value !== '') {
            comparison = value.split(':');
            if(comparison.length === 2){
                condition[key] =  compare.format(comparison[0],comparison[1]);
            } else {
                condition[key] = value;
            }
        }
    }
    return condition;
}


var compare = {
    format : function(comparison,value){
        var formatted = value;
        switch(comparison){
            case 'gt'  : formatted = compare.greater(value);break;
            case 'lt'  : formatted = compare.lower(value);break;
            case 'gte' : formatted = compare.greaterOrEqual(value);break;
            case 'lte' : formatted = compare.lowerOrEqual(value);break;
            case 'eq'  : formatted = compare.equal(value);break;
            case 'neq' : formatted = compare.notEqual(value);break;
            case 'in'  : formatted = compare.in(value);break;
            case 'nin' : formatted = compare.notIn(value);break;
        }
        return formatted;
    },
    greater        : function (value){return {$gt  : value};},
    lower          : function (value){return {$lt  : value};},
    greaterOrEqual : function (value){return {$gte : value};},
    lowerOrEqual   : function (value){return {$lte : value};},
    equal          : function (value){return {$eq  : value};},
    notEqual       : function (value){return {$neq : value};},
    in             : function (value){return {$in  : value};},
    notIn          : function (value){return {$nin : value};}
};


/*************************************
    UPDATE
 ********/

function __mongooseFormatUpdateQuery(model,fields,data){
    if(model && fields){
        var field;
        for(var i = 0; i < fields.length ; i++){
            field = model.schema.paths[fields[i]];
            if(field){
                switch(field.instance){
                    case 'Array':
                        data = __mongooseFormatInsertArray(field,data);
                        break;
                }
            }
        }
    }
    return data;
}


function __mongooseFormatInsertArray(field,data){
    var container = data.$push || {};
    container[field.path] = data;
    if(!data.$push){
        return {$push : container};
    }
    return container;
}
