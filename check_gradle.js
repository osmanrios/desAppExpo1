const fs = require('fs');
const content = fs.readFileSync('android/app/build.gradle', 'utf8');
const start = content.indexOf('compileSdk rootProject');
console.log(content.slice(start, start + 400));