import styles from "./LoadingSpinner.module.css";


export function LoadingSpinner({width="48px", height="48px"}) {
    return (
        <div className={styles.loadingSpinner} style={{width: width, height: height}}></div>
    )
}