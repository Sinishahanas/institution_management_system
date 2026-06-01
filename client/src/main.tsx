import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Entry point of the React application.
 *
 * @purpose
 * - Mounts the root React component into the HTML DOM.
 * - Initializes the React application by selecting the DOM element with id "root".
 * - Renders the <App /> component into that root element using React 18's `createRoot` API.
 * - Imports global styles from `index.css`.
 * - Uses the non-null assertion (`!`) to assure TypeScript that `getElementById("root")` will not return null.
 * - Provides the bootstrap logic that starts the React app and attaches it to the browser's DOM.
 * 
 * @param {HTMLElement} rootElement - The DOM element where the React app will be mounted.
 * @returns {void} Nothing is returned; the function initializes rendering as a side effect.
 *
 * @sideEffects
 * - Mutates the DOM by injecting React's virtual DOM tree into the `#root` element.
 * - Loads and applies global CSS styles.
 *
 * @throws {Error} Will throw an error if `document.getElementById("root")` returns `null`
 *   and the non-null assertion `!` is not used (or removed).
 * 
 * @example
 * // HTML file should contain:
 * // <div id="root"></div>
 */
createRoot(document.getElementById("root")!).render(<App />);
