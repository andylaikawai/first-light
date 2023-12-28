import logToFile from 'log-to-file'

const timeNow = () => {
  return new Date().toISOString();
};

export const log = (message, toFile = false) => {
  console.log(`${timeNow()} ${message}`);
  if (toFile) {
    logFile(message)
  }
};

export const logFile = (message) => {
  logToFile(message, '../log/v1.log', '\r\n')
};

export const randomStr = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
};

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};