var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB();
var params = {
    TableName: "users",
    KeySchema: [
        { AttributeName: "email", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};
dynamodb.createTable(params, function (err, data) {
    if (err) {
        console.error("Error is creating a users table. JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Table Created. Table description JSON:", JSON.stringify(data, null, 2));
    }
});