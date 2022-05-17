function getDate() {
    const date = new Date()
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
  
    return month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ':' + second
  }

console.log(getDate());