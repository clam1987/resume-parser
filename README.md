# Resume Parser

Using [perminder-klair's resume parser](https://github.com/perminder-klair/resume-parser) as a base, repurposed his library to parse information out of linkedin's resume. Everything is the same as his library except, that it parses through linkedin with a new method.

## Installation
```
npm i
```

## Usage
```
ResumeParser.readResume('./Profile.pdf')
  .then(data => {
    console.log(data)
  })
```
The parser takes in a pdf file and returns the following fields if available:
- name
- email
- address
- profiles
- skills
- languages
- summary
- experience
- education

## Contributions

Huge shout out to [perminder-klair](https://github.com/perminder-klair) on his work and also huge shot out to [Alexey Lizurchik](https://github.com/likerRr) for making the base for all of this.