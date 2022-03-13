let creds = require('../../config/creds.json');
const AWS = require('aws-sdk');
const fs = require('fs');
let issueBookTemp = require('../../config/issueBookTemp.json');

AWS.config.update({
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
    sessionToken: creds.sessionToken,
    region: creds.region
});

var sns = new AWS.SNS();

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
        if (data) {
            res.send(data);
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