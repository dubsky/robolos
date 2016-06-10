var parseFilterString = function (filterString) {
  var startQuoteRegExp = /^[\'\"]/;
  var endQuoteRegExp = /[\'\"]$/;
  var filters = [];
  var words = filterString.split(' ');

  var inQuote = false;
  var quotedWord = '';
  _.each(words, function (word) {
    if (inQuote) {
      if (endQuoteRegExp.test(word)) {
        filters.push(quotedWord + ' ' + word.slice(0, word.length - 1));
        inQuote = false;
        quotedWord = '';
      } else {
        quotedWord = quotedWord + ' ' + word;
      }
    } else if (startQuoteRegExp.test(word)) {
      if (endQuoteRegExp.test(word)) {
        filters.push(word.slice(1, word.length - 1));
      } else {
        inQuote = true;
        quotedWord = word.slice(1, word.length);
      }
    } else {
      filters.push(word);
    }
  });
  return filters;
};

var escapeRegex = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

getFilterQuery = function (filterInputs, filterFields, settings) {
  settings = settings || {};
  if (settings.enableRegex === undefined) {
    settings.enableRegex = false;
  }
  if (settings.fields) {
    _.each(filterInputs, function (filter, index) {
      if (_.any(settings.fields, function (include) { return include; })) {
        filterFields[index] = _.filter(filterFields[index], function (field) {
          return settings.fields[field];
        });
      } else {
        filterFields[index] = _.filter(filterFields[index], function (field) {
          return _.isUndefined(settings.fields[field]) || settings.fields[field];
        });
      }
    });
  }
  var numberRegExp = /^\d+$/;
  var queryList = [];
  _.each(filterInputs, function (filter, index) {
    if (filter) {
      if (_.isObject(filter)) {
        var fieldQueries = _.map(filterFields[index], function (field) {
          var query = {};
          query[field] = filter;
          return query;
        });
        if (fieldQueries.length) {
            queryList.push({'$or': fieldQueries});
          }
      } else {
        var filters = parseFilterString(filter);
        _.each(filters, function (filterWord) {
          if (settings.enableRegex === false) {
            filterWord = escapeRegex(filterWord);
          }
          var filterQueryList = [];
          _.each(filterFields[index], function (field) {
            var filterRegExp = new RegExp(filterWord, 'i');
            var query = {};
            query[field] = filterRegExp;
            filterQueryList.push(query);

            if (numberRegExp.test(filterWord)) {
              var numberQuery = {};
              numberQuery[field] = parseInt(filterWord, 10);
              filterQueryList.push(numberQuery);
            }

            if (filterWord === "true") {
              var boolQuery = {};
              boolQuery[field] = true;
              filterQueryList.push(boolQuery);
            } else if (filterWord === "false") {
              var boolQuery = {};
              boolQuery[field] = false;
              filterQueryList.push(boolQuery);
            }
          });

          if (filterQueryList.length) {
            var filterQuery = {'$or': filterQueryList};
            queryList.push(filterQuery);
          }
        });
      }
    }
  });
  return queryList.length ? {'$and': queryList} : {};
};

