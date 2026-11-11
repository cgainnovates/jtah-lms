import Button from "../Button/Button.jsx";
import {user} from "../../mocks/user.js"
export default function Avatar(){
    const initials = getInitials(user)
    let avatar;
    if (!user.profileImage){
        avatar = initials
    }else{
        avatar = <img src={user.profileImage} alt={initials}/>
    }
    return (
        <>
            <Button>{avatar}</Button>
        </>
    )
}
function getInitials(user){
    const username = user.fullname.split(" ")
    if( username.length > 1){
        return (username[0][0] + username[1][0])
    }else{
        return (username[0][0])
    }

}