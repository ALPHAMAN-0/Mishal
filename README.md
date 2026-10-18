# Mishal

## Architecture / How it Works

```mermaid
flowchart TD
    index.html --> style.css
    index.html --> GSAP
    index.html --> firebase-config.js
    index.html --> auth.js
    index.html --> drag-drop.js
    index.html --> editor.js
    index.html --> app.js
    index.html --> images
    firebase-config.js --> Firebase
    auth.js --> Firebase
    editor.js --> Firebase
    app.js --> Firebase
```
