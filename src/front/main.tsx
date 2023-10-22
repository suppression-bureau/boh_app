import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import { Provider, cacheExchange, createClient, fetchExchange } from "urql"

import App from "./App.tsx"

const client = createClient({
    url: "http://localhost:8000/graphql",
    suspense: true,
    exchanges: [cacheExchange, fetchExchange],
})

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider value={client}>
            <Router>
                <App />
            </Router>
        </Provider>
    </React.StrictMode>,
)
