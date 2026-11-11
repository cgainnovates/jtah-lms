import styles from "./ProgressRing.module.css";
export default function ProgressRing({value=0,size=76,label="Complete"}){const n=Math.max(0,Math.min(100,Number(value)||0));return <div className={styles.ring} style={{width:size,height:size,"--progress":`${n*3.6}deg`}} role="img" aria-label={`${n}% ${label}`}><div><strong>{n}%</strong></div></div>}
