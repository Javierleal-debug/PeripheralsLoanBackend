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
    return year + '-' + month + '-' + day + '-' + hour + '.' + minute + '.' + second +'.'
  }
console.log(getDate());