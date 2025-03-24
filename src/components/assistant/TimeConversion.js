// Complete the time conversion funciton it should retrun a new string representing the input time in 24 hour format  time conversion has the following parameters : string s : a time in 12 hour format / returns string : the time in 24 hour format

const timeConversion = (s) => {
    const time = s.split(':');
    const hour = parseInt(time[0]);
    const minute = parseInt(time[1]);
    const second = parseInt(time[2]);
    const ampm = s.slice(-2);
    if(ampm === 'PM' && hour !== 12){
        hour += 12;
    }
    if(ampm === 'AM' && hour === 12){
        hour = 0;
    }
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}

console.log(timeConversion('12:00:00PM'));

