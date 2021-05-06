var _ = require('underscore'),
  resume = require('../Resume'),
  fs = require('fs'),
  dictionary = require('../../dictionary.js'),
  logger = require('tracer').colorConsole(),
  fe = require('./firstnames_f.json'),
  ma = require('./firstnames_m.json'),
  lastNames = require('./surnames.json'),
  stopWords = require('./stopWords.json'),
  firstNames = [...fe, ...ma];

var profilesWatcher = {
  // for change value by reference
  inProgress: 0,
};

module.exports = {
  parse: parse,
  parseLinkedInResumes: parseLinkedInResumes,
};

function test() {
  const test = 'Contact\n' +
'11592 Celine St. El Monte, CA\n' +
'91732\n' +
'6265378307 (Home)\n' +
'cwlam1987@gmail.com\n' +
'www.linkedin.com/in/wilson-lam87\n' +
'(LinkedIn)\n' +
'www.wilsondevworks.com/\n' +
'(Personal)\n' +
'www.wilsondevworks.com/\n' +
'(Portfolio)\n' +
'Top Skills\n' +
'Front-end Development\n' +
'React.js\n' +
'JavaScript\n' +
'Languages\n' +
'Mandarian (Elementary)\n' +
'Wilson Lam\n' +
'Software Engineer at Model Match\n' +
'Los Angeles Metropolitan Area\n' +
'Summary\n' +
'I am a solutions-driven Full-Stack Web Developer with strong skill\n' +
"sets in both Front-End and Back-End. By utilizing these tools, I've\n" +
'built several features for Omou and created websites for local\n' +
'businesses.\n' +
'Working for Omou has taught me that the world of coding is vast.\n' +
"I've learned a lot from new ways to debug, problem solving from a\n" +
'high level, new frameworks and libraries, etc. While working as a\n' +
"Teaching Assistant for my bootcamp, I've reinforced and improved\n" +
'upon my problem solving skills in both Front-End and Back-End.\n' +
'Inherently, this job also gave me experience in some soft skills like\n' +
'communication, patience, and translating code to English.\n' +
'While attending the coding bootcamp through UCLA Extension, I\n' +
'gained experience in React, HTML, CSS, BootStrap for the Front-\n' +
'End while using Node, Express, MySQL and MongoDB for the Back-\n' +
'End.\n' +
'My love for technology has always been present, from when I first\n' +
'learned how to build my own computer, reading about security\n' +
'vulnerabilities of gaming systems, and watching tech conventions. It\n' +
'is the core of my motivation and why I continually learn new topics\n' +
'on coding.\n' +
'Experience\n' +
'Model Match\n' +
'Software Engineer\n' +
'March 2021 - Present (2 months)\n' +
'Omou Learning\n' +
'Frontend Developer\n' +
'February 2020 - Present (1 year 3 months)\n' +
'Greater Los Angeles Area\n' +
'Page 1 of 2\n' +
'Self employed\n' +
'Full-stack Developer\n' +
'October 2018 - Present (2 years 7 months)\n' +
'Greater Los Angeles Area\n' +
'UCLA Extension\n' +
'Teaching Assistant\n' +
'September 2019 - March 2021 (1 year 7 months)\n' +
'Westwood, California\n' +
'Letter Ride LLC\n' +
'Delivery Driver\n' +
'October 2018 - March 2019 (6 months)\n' +
'Temple City, CA\n' +
'Education\n' +
'UCLA Extension\n' +
'Certificate , Full Stack Web Development · (2019 - 2019)\n' +
'Page 2 of 2\n' +
'{end}';
let words2 = test.split('\n')
words2 = words2.filter((word) => {
	return word.split(' ').length < 4 && word.split(' ').length > 1
})
words2 = words2.join(' ').match(/([A-Z][a-z]*)/g)
words2 = words2.filter((word) => !stopWords.includes(word.toLowerCase()))
words = words2.filter((word) => !stopWords.includes(word.toLowerCase()))
console.log(words.length)
words.forEach((word, i) => {
	let count = 0
	if (words.includes(word)) count++
  if (count > 1) words.splice(i, 1)
})
let final = []
for (let i = 0; i < words.length ; i++) {
    if (firstNames.includes(words[i]) && lastNames.includes(words[i+1])) {
        final.push(words[i] + ' ' + words[i+1])
    }
}
console.log(words.length)
console.log(final)
}

function makeRegExpFromDictionary() {
  var regularRules = {
    titles: {},
    profiles: [],
    inline: {},
  };

  _.forEach(dictionary.titles, function(titles, key) {
    regularRules.titles[key] = [];
    _.forEach(titles, function(title) {
      regularRules.titles[key].push(title.toUpperCase());
      regularRules.titles[key].push(
        title[0].toUpperCase() + title.substr(1, title.length)
      );
    });
  });

  _.forEach(dictionary.profiles, function(profile) {
    var profileHandler, profileExpr;

    if (_.isArray(profile)) {
      if (_.isFunction(profile[1])) {
        profileHandler = profile[1];
      }
      profile = profile[0];
    }
    profileExpr =
      '((?:https?://)?(?:www\\.)?' +
      profile.replace('.', '\\.') +
      '[/\\w \\.-]*)';
    if (_.isFunction(profileHandler)) {
      regularRules.profiles.push([profileExpr, profileHandler]);
    } else {
      regularRules.profiles.push(profileExpr);
    }
  });

  _.forEach(dictionary.inline, function(expr, name) {
    regularRules.inline[name] = expr + ':?[\\s]*(.*)';
  });

  return _.extend(dictionary, regularRules);
}

// dictionary is object, so it will be extended by reference
makeRegExpFromDictionary();

function parse(PreparedFile, cbReturnResume) {
  console.log('line 65')
  console.log(PreparedFile)
  var rawFileData = PreparedFile.raw,
    Resume = new resume(),
    rows = rawFileData.split('\n'),
    row;

  // save prepared file text (for debug)
  //fs.writeFileSync('./parsed/'+PreparedFile.name + '.txt', rawFileData);

  // 1 parse regulars
  parseDictionaryRegular(rawFileData, Resume);

  for (var i = 0; i < rows.length; i++) {
    row = rows[i];

    // 2 parse profiles
    row = rows[i] = parseDictionaryProfiles(row, Resume);
    // 3 parse titles
    parseDictionaryTitles(Resume, rows, i);
    parseDictionaryInline(Resume, row);
  }

  if (_.isFunction(cbReturnResume)) {
    // wait until download and handle internet profile
    var i = 0;
    var checkTimer = setInterval(function() {
      i++;
      /**
       * FIXME:profilesWatcher.inProgress not going down to 0 for txt files
       */
      if (profilesWatcher.inProgress === 0 || i > 5) {
        //if (profilesWatcher.inProgress === 0) {
        cbReturnResume(Resume);
        clearInterval(checkTimer);
      }
    }, 200);
  } else {
    return console.error('cbReturnResume should be a function');
  }
}

/**
 * Make text from @rowNum index of @allRows to the end of @allRows
 * @param rowNum
 * @param allRows
 * @returns {string}
 */
function restoreTextByRows(rowNum, allRows) {
  rowNum = rowNum - 1;
  var rows = [];

  do {
    rows.push(allRows[rowNum]);
    rowNum++;
  } while (rowNum < allRows.length);

  return rows.join('\n');
}

/**
 * Count words in string
 * @param str
 * @returns {Number}
 */
function countWords(str) {
  return str.split(' ').length;
}

/**
 *
 * @param Resume
 * @param row
 */
function parseDictionaryInline(Resume, row) {
  var find;

  _.forEach(dictionary.inline, function(expression, key) {
    find = new RegExp(expression).exec(row);
    if (find) {
      Resume.addKey(key.toLowerCase(), find[1]);
    }
  });
}

/**
 *
 * @param data
 * @param Resume
 */
function parseDictionaryRegular(data, Resume) {
  var regularDictionary = dictionary.regular,
    find;
    // console.log('line 158, how regex is generated:')
    // console.log(regularDictionary)
    // console.log('line 160, what the raw data is:')
    // console.log(data)
  _.forEach(regularDictionary, function(expressions, key) {
    // console.log(expressions)
    // console.log(key)
    _.forEach(expressions, function(expression) {
      find = new RegExp(expression).exec(data);
      // console.log('results of regex:')
      // console.log(find)
      if (find) {
        Resume.addKey(key.toLowerCase(), find[0]);
        // console.log(Resume)
      }
    });
  });
};

function parseDictionaryRegularLinkedin(data, Resume) {
  const regularDictionary = dictionary.regularLinkedin;
  let find;
  const target = []
  // --Name Section--
// console.log(data)
  // const nameData = data.split('\n').filter((txt, i) => txt.split(' ').length < 3 && txt.split(' ').length > 1).join(' ').split(' ').filter((x, i, arr) => firstNames.includes(x) && lastNames.includes(x))
  const nameData = data.split('\n').filter((txt, i) => txt.split(' ').length < 4 && txt.split(' ').length > 1).join(' ').split(' ').filter(x => !x.match(/\(([^)]+)\)/) && !x.match(/"[^"]*"/));
  // const name = `${nameData[0]} ${nameData[1]}`
  // const newData = nameData
  // find = new RegExp(regularDictionary.name[0]).exec(nameData)
  // console.log(find)
  // const address = '11592 Celine St. El Monte, CA'
  // console.log(address.match(/\d{1,6}\s(?:[A-Za-z0-9#]+\s){0,7}(?:[A-Za-z0-9#]+,)\s*(?:[A-Za-z]+\s){0,3}(?:[A-Za-z]+,)\s*[A-Z]{2}\s*\d{5}/))
  // const email = 'wilsonlam@gmail.com'
  // console.log(regularDictionary.email[0])
  // console.log(email.match(regularDictionary.email[0]))
  // !stopWords.includes(txt.toLowerCase()) filter stop words
  // !txt.match(regularDictionary.email[0]) filter email
  // !x.match(/\(([^)]+)\)/) filter weird paranthesis
  // .join(' ').split(' ').filter((x, i, arr) => firstNames.includes(x) && lastNames.includes(x)); this filter works on getting my name
  // console.log(nameData)
  let final = []
for (let i = 0; i < nameData.length ; i++) {
    if (firstNames.includes(nameData[i]) && lastNames.includes(nameData[i+1])) {
        final.push(nameData[i] + ' ' + nameData[i+1])
    }
}

console.log('name:', final[0])

// --Email Section--
const emailData = new RegExp(regularDictionary.email[0]).exec(data)?.[0] || 'none'
console.log('email:', emailData)

// --Phone Section--
const phoneData = data.split('\n').filter((txt, i) => txt.split(' ').length < 3 && txt.split(' ').length > 1).join(' ').split(' ').filter(x => !x.match(/\(([^)]+)\)/) && (x.match(/^\d{3}-\d{3}-\d{4}$/) || x.match(/^\d{3}\d{3}\d{4}$/) || x.match(/^\d{3}\d{3}\d{4}$/) || x.match(/^\d{3}-\d{3}-\d{3}$/) || x.match(/^([\d]{6}|((\([\d]{3}\)|[\d]{3})( [\d]{3} |-[\d]{3}-)))[\d]{4}$/)))?.[0] || 'cannot parse'
// const phoneData = data.split('\n').filter(txt => txt.split(" ").filter(x => x.match(/^\(?\d{1,3}-?\)?\d*-?\d*/)).join('')).reduce((a, b) => {
//   b.split(' ').filter(x => {
//     if(x.match(/^\(?\d{2,3}-?\)?\d*-?\d*/)) {
//       a.push(x)
//     }
  
//   })
//   // console.log(b.match(/^\(?\d{1,3}-?\)?\d*-?\d*/))
//   return a
// }, []);
// const phoneData = data.split('\n').map(x => x.replace(/ /g, "")).filter(x => x.match(/^\(?\d{1,3}-?\)?\d*-?\d*/))
console.log(phoneData)

  // console.log(newData)
  // console.log(name)
      // console.log('parser.js line 181')
      // console.log(typeof data)
      // _.forEach(regularDictionary, function(expressions, keys) {
        // console.log(expressions)
        // _.forEach(expressions, function(expression) {
          // console.log(expression)
        // });
      // });
}

/**
 *
 * @param Resume
 * @param rows
 * @param rowIdx
 */
function parseDictionaryTitles(Resume, rows, rowIdx) {
  var allTitles = _.flatten(_.toArray(dictionary.titles)).join('|'),
    searchExpression = '',
    row = rows[rowIdx],
    ruleExpression,
    isRuleFound,
    result;

  _.forEach(dictionary.titles, function(expressions, key) {
    expressions = expressions || [];
    // means, that titled row is less than 5 words
    if (countWords(row) <= 5) {
      _.forEach(expressions, function(expression) {
        ruleExpression = new RegExp(expression);
        isRuleFound = ruleExpression.test(row);

        if (isRuleFound) {
          allTitles = _.without(allTitles.split('|'), key).join('|');
          searchExpression =
            '(?:' + expression + ')((.*\n)+?)(?:' + allTitles + '|{end})';
          // restore remaining text to search in relevant part of text
          result = new RegExp(searchExpression, 'gm').exec(
            restoreTextByRows(rowIdx, rows)
          );

          if (result) {
            Resume.addKey(key, result[1]);
          }
        }
      });
    }
  });
}

/**
 *
 * @param row
 * @param Resume
 * @returns {*}
 */
function parseDictionaryProfiles(row, Resume) {
  var regularDictionary = dictionary.profiles,
    find,
    modifiedRow = row;

  _.forEach(regularDictionary, function(expression) {
    var expressionHandler;

    if (_.isArray(expression)) {
      if (_.isFunction(expression[1])) {
        expressionHandler = expression[1];
      }
      expression = expression[0];
    }
    find = new RegExp(expression).exec(row);
    if (find) {
      Resume.addKey('profiles', find[0] + '\n');
      modifiedRow = row.replace(find[0], '');
      if (_.isFunction(expressionHandler)) {
        profilesWatcher.inProgress++;
        expressionHandler(find[0], Resume, profilesWatcher);
      }
    }
  });

  return modifiedRow;
}

function parseLinkedInResumes(PreparedFile, cbReturnResume) {
  // console.log('line 65')
  var rawFileData = PreparedFile.raw,
  Resume = new resume(),
  rows = rawFileData.split('\n'),
  row;
  // console.log(PreparedFile)

    // console.log(rows)

    // test()
  // save prepared file text (for debug)
  //fs.writeFileSync('./parsed/'+PreparedFile.name + '.txt', rawFileData);

  // 1 parse regulars
  parseDictionaryRegularLinkedin(rawFileData, Resume);

  // for (var i = 0; i < rows.length; i++) {
  //   row = rows[i];

  //   // 2 parse profiles
  //   row = rows[i] = parseDictionaryProfiles(row, Resume);
  //   // 3 parse titles
  //   parseDictionaryTitles(Resume, rows, i);
  //   parseDictionaryInline(Resume, row);
  // }

  // if (_.isFunction(cbReturnResume)) {
  //   // wait until download and handle internet profile
  //   var i = 0;
  //   var checkTimer = setInterval(function() {
  //     i++;
  //     /**
  //      * FIXME:profilesWatcher.inProgress not going down to 0 for txt files
  //      */
  //     if (profilesWatcher.inProgress === 0 || i > 5) {
  //       //if (profilesWatcher.inProgress === 0) {
  //       cbReturnResume(Resume);
  //       clearInterval(checkTimer);
  //     }
  //   }, 200);
  // } else {
  //   return console.error('cbReturnResume should be a function');
  // }
}
