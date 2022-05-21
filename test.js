const bcrypt = require('bcryptjs');
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
