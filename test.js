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
//     const { experience } = data;
//     const company = experience.split('\n')[0];
//     const title = experience.split('\n')[1];
//     console.log(`${title} at ${company}`)
//   })

// ResumeParser.readResume('./test18.docx')
//   .then(data => {
//     const { experience } = data;
//     const company = experience.split('\n')[0];
//     const title = experience.split('\n')[1];
//     console.log(`${title} at ${company}`)
//   })
// ResumeParser.readResume('./test17.pdf')
//   .then(data => {
//     const { experience } = data;
//     const company = experience.split('\n')[0];
//     const title = experience.split('\n')[1];
//     console.log(`${title} at ${company}`)
//   })

// ResumeParser.readResume('./test.pdf')
//   .then(data => {
//         const { experience } = data;
//         const title = experience.split('\n')[0];
//         const company = experience.split('\n')[1];
//         console.log(`${title} at ${company}`)
//   })

// for(let i = 1; i < 22; i++) {
//   ResumeParser.readResume(`./test${i}.pdf`)
//   .then(data => {
//     const { experience, name } = data;
//     const company = experience.split('\n')[0];
//     const title = experience.split('\n')[1];
//     console.log(name)
//     // console.log(`${title} at ${company}`)
//   })
// }
// console.log(m_firstnames.length)
// console.log(f_firstnames.length)
// console.log(m_firstnames2.length);
// console.log(f_firstnames2.length)