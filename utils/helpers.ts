const indexToLetter = (index:number):string => {
    return String.fromCharCode(65 + index);
};

const letterToIndex = (letter:string):number => {
    return letter.toUpperCase().charCodeAt(0) - 65;
};

export default {
  indexToLetter,
  letterToIndex,
};