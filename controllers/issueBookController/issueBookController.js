const creds = require('../../config/creds.json');
const AWS = require('aws-sdk');
const fs = require('fs');
const { response } = require('express');

AWS.config.update({
    region: "us-east-1",
})



const docClient = new AWS.DynamoDB.DocumentClient();

var sns = new AWS.SNS();

exports.getBookByID = async (req, res) => {
    const params = {
        TableName: "books",
        Key: {
            "id": req.params.id
        }
    };
    const bookDetails = await docClient.get(params).promise();

    if (bookDetails) {
        res.status(200).json(bookDetails);
    } else {
        res.status(404).json({ "message": "Unable to fetch Book details" });
    }
}

exports.getContactNumberByEmail = async (req, res) => {
    const params = {
        TableName: "users",
        Key: {
            "email": req.params.email
        }
    };
    const userDetails = await docClient.get(params).promise();

    if (userDetails) {
        res.status(200).json(userDetails);
    } else {
        res.status(404).json({ "message": "Unable to fetch user details" });
    }
}

exports.issueBook = async (req, res) => {
    var datetime = new Date();
    const TableName = "booksIssued";
    if (req.body) {
        let newBookIssued = {
            email: req.body.email,
            booksIssued: req.body.booksIssued,
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
                if (userData.Item || userData.Item.booksIssued) {
                    if (userData.Item.booksIssued.length >= 3) {
                        return res.status(200).json({ "message": "3 books already issued on your name. Cannot issue more books." })
                    } else {
                        await docClient.update({
                            TableName: TableName,
                            Key: { "email": newBookIssued.email },
                            UpdateExpression: 'set #booksIssued = list_append(if_not_exists(#booksIssued, :empty_list), :booksIssued)',
                            ExpressionAttributeNames: {
                                '#booksIssued': 'booksIssued'
                            },
                            ExpressionAttributeValues: {
                                ':booksIssued': [req.body.booksIssued],
                                ':empty_list': []
                            }
                        }).promise().then(async (booksData) => {
                            console.log("Book issued");
                            this.publishText(req);
                            console.log("Text message sent successfully");
                            this.publishEmail(req);
                            console.log("Email sent successfully");
                            return res.status(200).json({ "message": "Book issued successfully. Confirmation has been sent to your registered email." })
                        }).catch(err => {
                            console.log(JSON.stringify(err))
                            return res.status(404).json({ "message": "Unable to issue book: " + req.body.booksIssued[0] })
                        });
                    }
                }
                else {
                    console.log("System error. Something went wrong.")
                    res.status(404).json({ "message": "System error. Something went wrong." })
                }
            } else {
                await docClient.put(issueBookBody).promise().then((booksData) => {
                    console.log("Book issued", JSON.stringify(booksData));
                    this.publishText(req);
                    console.log("Text message sent successfully");
                    this.publishEmail(req);
                    console.log("Email sent successfully");
                    return res.status(200).json({ "message": "Book issued successfully. Confirmation has been sent to your registered email and contact number." })
                }).catch(err => {
                    console.log(JSON.stringify(err))
                    return res.status(404).json({ "message": "Unable to issue book: " + req.body.bookTitle })
                })
            }
        })
    }
}

exports.publishText = async (req, res) => {
    var message = req.body.booksIssued[0].bookTitle + " book has been issued on your name";
    let obj = {
        Message: message,
        Subject: "Book Issued",
        PhoneNumber: req.body.contactNumber
    };
    sns.publish(obj, (err, data) => {
        if (err) {
            return {
                status: "500",
                err: err
            }
        } else {
            return {
                status: "200",
                data: data
            };
        }
    })
};

exports.createTopic = async (req, res) => {
    const email_id = req.body.email;
    let topicArn = "";
    await sns.createTopic({
        Name: Math.floor(Math.random() * 10000000).toString()
    }, (err, response) => {
        if (err) {
            res.status(500).json({
                status: "500",
                err: err
            })
            console.log(err);
        } else {
            res.status(200).json({
                status: "200",
                Topic_Arn: response.TopicArn
            })
            console.log("TopicArn created");
            const object = {
                email: email_id,
                topicArn: response.TopicArn
            }
            topicArn = response.TopicArn;
            docClient.update({
                TableName: "users",
                Key: {
                    "email": email_id
                },
                UpdateExpression: 'set TopicArn = :TopicArn',
                ExpressionAttributeValues: {
                    ":TopicArn": topicArn,
                },
            }).promise().then(data => {
                console.log("Topic Arn updated");
                this.subscribe(object);
            }).catch(console.error);
        }

    })
}

exports.subscribe = async (req, res) => {
    sns.subscribe({
        Protocol: 'EMAIL',
        TopicArn: req.topicArn,
        Endpoint: req.email
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log("subscribed")
        }
    })
}

exports.publishEmail = async (req, res) => {
    const params = {
        TableName: "users",
        Key: {
            "email": req.body.email
        }
    };
    await docClient.get(params).promise().then(async (userDetails) => {
        console.log("entered publish email");
        var message = req.body.booksIssued[0].bookTitle + " book has been issued on your name"
        console.log({
            Message: message,
            Subject: "Book Issued",
            TopicArn: userDetails.Item.TopicArn
        });

        console.log(" Hello");
        sns.publish({
            Message: message,
            Subject: "Book Issued",
            TopicArn: userDetails.Item.TopicArn
        }, (err, data) => {
            if (err) {
                console.log("Error occured: " + err);
            } else {
                console.log("email sent successfully");
            }
        })
    }).catch(err => {
        console.log(err);
    });
}