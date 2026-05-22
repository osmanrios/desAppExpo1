 
const fs = require('fs');
const path = 'android/app/build.gradle';

let content = fs.readFileSync(path, 'utf8');

const insert = `
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
`;

content = content.replace(
    'compileSdk rootProject.ext.compileSdkVersion',
    'compileSdk rootProject.ext.compileSdkVersion' + insert
);

fs.writeFileSync(path, content);
console.log('Listo! Cambio aplicado.');