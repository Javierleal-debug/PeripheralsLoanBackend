const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailConfig = require('./config/mail.config')

function getDate() {
    var date = new Date()
    var day = date.getDate()
    var month = date.getMonth() + 1
    var year = date.getFullYear()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    if(second < 10){
        second = '0'+ second;
    }
    if(minute < 10){
        minute = '0'+ minute;
    }
    return year + '-' + month + '-' + day
  }
var date=getDate();
console.log(date.length);
console.log(date);
const pwd=bcrypt.hashSync("wilebaldo123",8);
console.log(pwd)
const onlyLettersPattern = /^[-.@_A-Za-z0-9 ]+$/;
var userQuery="drop table-_ @ peripheral";
console.log(userQuery.match(onlyLettersPattern))
if(!userQuery.match(onlyLettersPattern)){
    console.log( "No special characters, please!")
}
var serialNumber="FCD16HKE8PXGRC27UNR7HRKEI31SVI7GV";
var employeeEmail="oscar@miranda.com"
var serialNumberUrl = jwt.sign({serialNumber:serialNumber,email:employeeEmail},mailConfig.secret, {expiresIn: 172800})
console.log(serialNumberUrl);