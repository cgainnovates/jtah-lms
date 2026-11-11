import styles from "./Topbar.module.css"
import "../../styles/global.css"
import "../../styles/tokens.css"
import {Bell} from "lucide-react"
import Icon from "../../components/Icon/Icon.jsx"
import Avatar from "../../components/Avatar/Avatar.jsx";
const purple = "#5B3FA8";
export default function Topbar(){
    return (
        <main>
            <header className={styles.topbar}>
                <input
                    type={"text"}
                    placeholder={"Search courses, lessons, resources"}
                    name={"search"}
                    aria-label={"search"}
                    id={"search"}
                    className={styles.searchInput}
                />
                <span>
                    <Icon
                        src={Bell}
                        color={purple}
                        fill={purple}
                        className={styles.notificationIcon}
                    />
                    <Avatar/>
                </span>
            </header>
        </main>
    )
}