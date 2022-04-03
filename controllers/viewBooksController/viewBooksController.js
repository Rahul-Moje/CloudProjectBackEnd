var AWS = require('aws-sdk')

AWS.config.update({
    region: "us-east-1",
})

var dynamoDBClient = new AWS.DynamoDB.DocumentClient();
var s3Client = new AWS.S3();



exports.getBooksData = async (req, res) => {
    try {

        var queryParams = {
            TableName: 'books'
        }

        var books = await dynamoDBClient.scan(queryParams).promise();
        books = books.Items

        for (var i = 0; i < books.length; i++) {
            queryParams = {
                Bucket: 'bookaholic-books-images-new',
                Key: books[i].s3ObjectKey
            }
            var image = await s3Client.getObject(queryParams).promise()
            books[i].image = 'data:image/jpg;base64,' + new Buffer.from(image.Body).toString("base64")
        }

        return res.status(200).json(books)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: 'false', message: 'Error while communicating with AWS' })
    }
}