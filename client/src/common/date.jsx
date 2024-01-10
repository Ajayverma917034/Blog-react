let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
let days =  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const getDay = (timestamp) => {
    let date = new Date(timestamp)
    return `${date.getDate()} ${months[date.getMonth()]}`
}

export const getFullDay = (timestamp) =>{
    let date = new Date(timestamp)
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}