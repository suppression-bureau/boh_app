import React from "react"
import ReactDOM from "react-dom/client"
import { Provider, createClient, fetchExchange } from "urql"
import { BrowserRouter as Router } from "react-router-dom"

import App from "./App.tsx"

const client = createClient({
    url: "http://localhost:8000/graphql",
    suspense: true,
    exchanges: [fetchExchange],
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
