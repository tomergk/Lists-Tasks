function formatNumberWithLeadingZero(number) {
  return number < 10 ? `0${number}` : number;
}

function updateDateTime() {
  const datePart = document.querySelector(".date-part");
  const timePart = document.querySelector(".time-part");
  
  const currentDate = new Date();
  
  const day = currentDate.getDate(); 
  const month = currentDate.getMonth() + 1; 
  const year = currentDate.getFullYear(); 
  const hours = currentDate.getHours(); 
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds(); 
  
  // Format the date and time components in the desired format
  const dateFormat = `${day}/${month}/${year}`;
  const timeFormat = `${formatNumberWithLeadingZero(hours)}:${formatNumberWithLeadingZero(minutes)}:${formatNumberWithLeadingZero(seconds)}`;
  
  datePart.innerHTML = dateFormat;
  timePart.innerHTML = timeFormat;
}

updateDateTime();

setInterval(updateDateTime, 1000);
