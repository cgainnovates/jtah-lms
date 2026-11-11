import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import styles from "./LearnerLayout.module.css"

export default function LearnerLayout(){
    return (
        <main className={styles.parentLayout}>
            <section className={styles.sidebar}>
                <Sidebar/>
            </section>
            <section className={styles.bars}>
                <Topbar/>
            </section>
        </main>
    )
}