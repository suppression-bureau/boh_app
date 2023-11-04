import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import * as urql from "urql"

import App from "./App.tsx"
import { DrawerContextProvider } from "./components/Drawer/index.tsx"

const client = urql.createClient({
    url: "http://localhost:8000/graphql",
    suspense: true,
    exchanges: [urql.cacheExchange, urql.fetchExchange],
})

ReactDOM.createRoot(document.querySelector("#root")!).render(
    <React.StrictMode>
        <urql.Provider value={client}>
            <Router>
                <DrawerContextProvider>
                    <App />
                </DrawerContextProvider>
            </Router>
        </urql.Provider>
    </React.StrictMode>,
)
