# VUcept-Management-Backend

## Description
This is the backend code base for VUcept Management project

## Tech Stack
Language: Node.js
Reqeust Handling: Express

## Deployment Local
1. Make sure that you are using the correct versions, and below dependencies are added into package.json<br/>
    express: 4.18.1<br/>
    aws-sdk: latest<br/>
    body-parser: latest<br/>
    cors: 2.8.5<br/>
    dotenv: 16.0.2<br/>
    express: 4.18.1<br/>
    mysql: latest (if this doesn't work, use mysql2)<br/>
    nodemon: 2.0.20
2. npm install<br/>
3. node index.js<br/>


## Test suite
1. create local database and add below variables to .env file. Ensure TEST_STATUS=1.<br/>
    LOCAL_HOSTNAME=<br/>
    LOCAL_PORT=<br/>
    LOCAL_USERNAME=<br/>
    LOCAL_PASSWORD=<br/>
    LOCAL_DATABASE=<br/>
    TEST_STATUS=1<br/>
2. npm i -D jest supertest<br/>
3. npm run test<br/><br/>
Note: Please run unit tests one at a time, as the API calls would make changes to the database
which may lead failed tests otherwise. Moreover, please follow instructions within each test file, reagarding status of the database prior to running the tests.