const ResumeParser = require('./src');
const m_firstnames = require('./src/utils/libs/firstnames_m.json');
const f_firstnames = require('./src/utils/libs/firstnames_f.json');
const fs = require('fs');

// const fileDir = process.cwd();
// ResumeParser
//   .parseResumeFile(fileDir + '/test16.pdf', fileDir + '/compiled') //input file, output dir
//   .then(file => {
//     console.log("Yay! " + file);
//   })
//   .catch(error => {
//     console.log('parseResume failed');
//     console.error(error);
//   });

// ResumeParser.parseResumeUrl("") // url
//   .then(data => {
//     console.log('Yay! ', data);
//   })
//   .catch(error => {
//     console.log('parseResume failed');
//     console.error(error);
//   });
// ResumeParser.readResume('./Profile.pdf')
//   .then(data => {
//         // console.log(data)
//   })

// ResumeParser.readResume('./test18.docx')
//   .then(data => {
//         console.log(data)
//   })
ResumeParser.readResume('./test21.pdf')
  .then(data => {
        console.log(data)
  })

// ResumeParser.readResume('./test.pdf')
//   .then(data => {
//         console.log(data)
//   })

// for(let i = 1; i < 20; i++) {
//   ResumeParser.readResume(`./test${i}.pdf`)
//   .then(data => {
//       // console.log(data)
//   })
// }
// console.log(m_firstnames.length)
// console.log(f_firstnames.length)
// console.log(m_firstnames2.length);
// console.log(f_firstnames2.length)