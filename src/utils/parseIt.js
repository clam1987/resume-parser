var ParseBoy = require('./ParseBoy');
var processing = require('./libs/processing');
var _ = require('underscore');
var logger = require('tracer').colorConsole();

var parser = {
  parseResumeFile: function(file, savePath, cbAfterParse) {
    var objParseBoy = new ParseBoy(),
      savedFiles = 0;

    var onFileReady = function(preppedFile, error) {
      if (error) {
        return cbAfterParse(null, error);
      }
      objParseBoy.parseFile(preppedFile, function(Resume) {
        logger.trace(
          'I got Resume for ' + preppedFile.name + ', now saving...'
        );

        objParseBoy.storeResume(preppedFile, Resume, savePath, function(err) {
          if (err) {
            logger.error('Resume ' + preppedFile.name + ' errored', err);
            return cbAfterParse(
              null,
              'Resume ' + preppedFile.name + ' errored'
            );
          }
          logger.trace('Resume ' + preppedFile.name + ' saved');
          return cbAfterParse(preppedFile.name);
        });
      });
    };
    processing.runFile(file, onFileReady);
  },
  parseResumeUrl: function(url, cbAfterParse) {
    var objParseBoy = new ParseBoy();

    var onUrlReady = function(preppedData, error) {
      if (error) {
        return cbAfterParse(null, error);
      }

      objParseBoy.parseUrl(preppedData, function(Resume) {
        logger.trace('I got Resume for ' + url + ', now sending...');
        return cbAfterParse(Resume.parts);
      });
    };

    processing.runUrl(url, onUrlReady);
  },
  parseResumeFromFile: function(file, cbAfterParse) {
    var objParseBoy = new ParseBoy();

    var onFileReady = function(preppedData, error) {
      if(error) return cbAfterParse(null, error);

      objParseBoy.readFile(preppedData, function(Resume) {
        // console.log(preppedData)
        // console.log('line 59')
        // console.log(Resume)
        logger.trace(
          'I got Resume for ' + preppedData.name + ', now saving...'
        );
        return cbAfterParse(Resume.parts)
      });
    }
    processing.runFile(file, onFileReady);
  },
};
module.exports = parser;
