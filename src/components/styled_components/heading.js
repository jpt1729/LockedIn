export default function Heading({ level = 1, children, className, ...props }) {
    switch (level) {
        case 1:
            return <h1 className={`font-[family-name:var(--font-crimson-text)] text-6xl font-bold ${className}`} {...props}>{children}</h1>
        case 2:
            return <h2 className={`font-[family-name:var(--font-crimson-text)] text-2xl ${className}`} {...props}>{children}</h2>;
        case 3:
            return <h3 {...props}>{children}</h3>
    }
  
}
