const ResumeParser = require('./src');

const fileDir = process.cwd();
ResumeParser
  .parseResumeFile(fileDir + '/test.pdf', fileDir + '/compiled') //input file, output dir
  .then(file => {
    console.log("Yay! " + file);
  })
  .catch(error => {
    console.log('parseResume failed');
    console.error(error);
  });

// ResumeParser.parseResumeUrl("") // url
//   .then(data => {
//     console.log('Yay! ', data);
//   })
//   .catch(error => {
//     console.log('parseResume failed');
//     console.error(error);
//   });
ResumeParser.readResume('./Profile.pdf')
    .then(data => {
        // console.log(data)
    })
