var AWS = require("aws-sdk");

var dynamodb = new AWS.DynamoDB();
var params = {
    TableName: "booksIssued",
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
        console.error("Error in creating books table. JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Table Created. Table description JSON:", JSON.stringify(data, null, 2));
    }
});