import {initialCourses,initialCareers,initialUsers,initialAnnouncements} from "../mocks/data.js";
import {readStore,writeStore} from "./storage.js";
const collection={courses:"courses",careers:"careers",users:"users",announcements:"announcements"};
const defaults={courses:initialCourses,careers:initialCareers,users:initialUsers,announcements:initialAnnouncements};
export const repository={
 list(name){return readStore(collection[name],defaults[name]||[])},
 get(name,id){return this.list(name).find(item=>item.id===id)||null},
 save(name,item){const rows=this.list(name);const index=rows.findIndex(row=>row.id===item.id);if(index>=0)rows[index]={...rows[index],...item};else rows.unshift({...item,id:item.id||`${name.slice(0,-1)}-${Date.now()}`});writeStore(collection[name],rows);return item},
 remove(name,id){const rows=this.list(name).filter(row=>row.id!==id);writeStore(collection[name],rows);return rows},
 update(name,id,patch){const rows=this.list(name).map(row=>row.id===id?{...row,...patch}:row);writeStore(collection[name],rows);return rows.find(row=>row.id===id)}
};
