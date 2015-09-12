exports = {
    'stringToInt': function (value, silent) {
        var result;
        try {
            result = parseInt(value);
        }
        catch(ex) {
            if (silent)
                return Number.NaN;
            else throw ex;
        }
        return result;
    },
    'stringToFloat': function (value, silent) {
        var result;
        try {
            result = parseFloat(value);
        }
        catch(ex){
            if (silent)
                return Number.NaN;
            else throw ex;
        }

        return result;
    },
    'intToBoolean': function(value, silent) {
        return !!value;
    }
};