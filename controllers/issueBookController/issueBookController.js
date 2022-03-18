const creds = require('../../config/creds.json');
const AWS = require('aws-sdk');
const fs = require('fs');
let issueBookTemp = require('../../config/issueBookTemp.json');

AWS.config.update({
    credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
    },
    region: creds.region,
    endpoint: creds.endpoint
});

const docClient = new AWS.DynamoDB.DocumentClient();

var sns = new AWS.SNS();

exports.getBookByID = async (req, res) => {
    console.log("entered");
    const params = {
        TableName: "books",
        Key: {
            "id": req.params.id
        }
    };
    docClient.get(params).promise().then(async (bookDetails) => {
        res.status(200).json(bookDetails);
    }).catch(err => {
        console.log(err);
        return res.status(400).json({ "message": "Unable to fetch Book details" });
    });
}

exports.issueBook = async (req, res) => {
    var datetime = new Date();

    const TableName = "booksIssued";
    if (req.body) {
        let newBookIssued = {
            email: req.body.email,
            book_title: req.body.book,
            date: datetime.toLocaleDateString()
        };

        const issueBookBody = {
            TableName: TableName,
            Item: newBookIssued
        };

        const booksIssuedToUser = {
            TableName: TableName,
            Key: {
                "email": newBookIssued.email
            }
        };
        docClient.get(booksIssuedToUser).promise().then(async (userData) => {
            if (Object.keys(userData).length !== 0) {
                if (userData.Item || userData.Item.book_title) {
                    console.log(userData.Item.book_title.length)
                    if (userData.Item.book_title.length >= 3) {
                        console.log("3 books already issued. Cannot issue more books")
                        res.status(400).json({ "message": "3 books already issued on your name. Cannot issue more books." })
                    } else {
                        await docClient.put(issueBookBody).promise().then((booksData) => {
                            console.log("Book issued", JSON.stringify(booksData));
                            return res.status(200).json({ message: newBookIssued })
                        }).catch(err => {
                            console.log(JSON.stringify(err))
                            return res.status(400).json({ "message": "Unable to issue book: " + req.body.book_title })
                        })
                    }
                }
                else {
                    console.log("System error. Something went wrong.")
                    res.status(400).json({ "message": "System error. Something went wrong." })
                }
            } else {
                await docClient.put(issueBookBody).promise().then((booksData) => {
                    console.log("Book issued", JSON.stringify(booksData));
                    return res.status(200).json({ message: newBookIssued })
                }).catch(err => {
                    console.log(JSON.stringify(err))
                    return res.status(400).json({ "message": "Unable to issue book: " + req.body.book_title })
                })
            }
        })
    }
}

exports.publishText = async (req, res) => {
    var message = req.body.book + " book has been issued on your name"
    sns.publish({
        Message: message,
        Subject: "Book Issued",
        PhoneNumber: req.body.mobile
    }, (err, data) => {
        if (err) {
            res.status(500).json({
                status: "500",
                err: err
            })
        } else {
            res.status(200).json({
                status: "200",
                data: data
            })
        }
    })
};

exports.createTopic = async (req, res) => {
    sns.createTopic({
        Name: Math.floor(Math.random() * 10000000).toString()
    }, (err, response) => {
        if (err) {
            res.status(500).json({
                status: "500",
                err: err
            })
        } else {
            res.status(200).json({
                status: "200",
                Topic_Arn: response.TopicArn
            })
            fs.readFile('./config/issueBookTemp.json', function (err, data) {
                var json = JSON.parse(data);
                json.users.push({
                    Name: req.body.name,
                    Email: req.body.email,
                    Topic_Arn: response.TopicArn
                })
                fs.writeFile('./config/issueBookTemp.json', JSON.stringify(json), 'utf-8', function (err) {
                    if (err) throw err
                })
            })
        }
    })
}

exports.subscribe = async (req, res) => {
    var index = issueBookTemp.users.findIndex(function (item, i) {
        return item.Email === req.body.email
    });
    sns.subscribe({
        Protocol: 'EMAIL',
        TopicArn: issueBookTemp.users[index].Topic_Arn,
        Endpoint: req.body.email
    }, (err, data) => {
        if (err) {
            res.status(500).json({
                status: "500",
                err: err
            })
        } else {
            res.status(200).json({
                status: "200",
                data: data
            })
        }
    })
}

exports.publishEmail = async (req, res) => {
    var index = issueBookTemp.users.findIndex(function (item, i) {
        return item.Email === req.body.email
    });
    var message = req.body.book + " book has been issued on your name"
    sns.publish({
        Message: message,
        Subject: "Book Issued",
        TopicArn: issueBookTemp.users[index].Topic_Arn
    }, (err, data) => {
        if (err) {
            res.status(500).json({
                status: "500",
                err: err
            })
        } else {
            res.status(200).json({
                status: "200",
                data: data
            })
        }
    })
}