const PREFIX="jtah_lms_";
export function readStore(key,fallback){try{const value=localStorage.getItem(PREFIX+key);return value?JSON.parse(value):fallback}catch{return fallback}}
export function writeStore(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true}catch{return false}}
export function resetStore(){Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>localStorage.removeItem(k))}
