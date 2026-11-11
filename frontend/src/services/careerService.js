import {repository} from "./mockRepository.js";
export const careerService={getAll:async()=>repository.list("careers"),getById:async id=>repository.get("careers",id),save:async data=>repository.save("careers",data),remove:async id=>repository.remove("careers",id)};
