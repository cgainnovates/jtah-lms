import styles from "./Card.module.css";
export default function Card({children,className="",title,action,variant="default"}){return <section className={`${styles.card} ${styles[variant]||""} ${className}`}>{(title||action)&&<header className={styles.header}>{title&&<h2>{title}</h2>}{action}</header>}{children}</section>}
