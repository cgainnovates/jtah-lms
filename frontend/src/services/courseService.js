import {repository} from "./mockRepository.js";
export const courseService={getAll:async()=>repository.list("courses"),getById:async id=>repository.get("courses",id),create:async data=>repository.save("courses",data),update:async(id,data)=>repository.save("courses",{...data,id}),remove:async id=>repository.remove("courses",id)};
